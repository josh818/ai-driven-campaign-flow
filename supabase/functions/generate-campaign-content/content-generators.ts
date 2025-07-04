import { CampaignData, AISettings } from './types.ts';
import { 
  uploadBase64ToStorage, 
  uploadUrlToStorage, 
  updateContentWithFileInfo,
  FileUploadResult 
} from './storage-utils.ts';

export async function generateCopyContent(
  platform: string,
  contentType: string,
  campaignData: CampaignData,
  aiSettings: AISettings
): Promise<string> {
  const tone = aiSettings?.tone || 'professional';
  const isEmail = platform === 'email';
  
  // Use Gemini API only
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  const prompt = `Create ${contentType} ${isEmail ? 'email' : 'copy'} for ${platform} for the campaign "${campaignData.title}" by ${campaignData.brand_name}.
                 
                 CAMPAIGN DETAILS TO FOLLOW CLOSELY:
                 - Brand: ${campaignData.brand_name}
                 - Title: ${campaignData.title}
                 - Description: ${campaignData.description || 'Premium brand experience'}
                 - Target audience: ${campaignData.target_audience || 'general audience'}
                 - Campaign goals: ${campaignData.campaign_goals?.join(', ') || 'brand awareness'}
                 
                 TONE REQUIREMENT (CRITICAL): The content MUST be written in a ${tone} tone. Examples:
                 - Professional: Formal, business-like, authoritative
                 - Casual: Friendly, conversational, relaxed language
                 - Enthusiastic: Energetic, exciting, full of energy
                 - Informative: Educational, fact-based, clear explanations
                 - Humorous: Light-hearted, funny, entertaining
                 
                  ${isEmail ? `EMAIL REQUIREMENTS:
                  - Create a longer-form email (300-500 words)
                  - Include subject line, greeting, body paragraphs, and clear call-to-action
                  - Structure with headers and proper email formatting
                  - Focus on the campaign description: ${campaignData.description}
                  - Include placeholder for visual content: [VISUAL CONTENT - Professional image/video will be included]` : ''}
                 
                 PLATFORM GUIDELINES:
                 ${platform === 'linkedin' ? 'Professional and business-focused' : 
                   platform === 'twitter' ? 'Concise and engaging with hashtags (under 280 chars)' : 
                   platform === 'instagram' ? 'Visually descriptive and lifestyle-focused' :
                   platform === 'facebook' ? 'Engaging and conversational' :
                   platform === 'email' ? 'Professional email format with clear structure' :
                   'Engaging and conversational'}
                 
                 Keywords to naturally include: ${aiSettings?.keywords || 'quality, innovation'}
                 
                 ${contentType === 'paid_ad' ? 'Include a compelling offer and clear call-to-action for paid advertising.' : 'Focus on engagement and brand storytelling.'}
                 
                 IMPORTANT: The content must directly relate to the campaign description: "${campaignData.description}"`;

  try {
    console.log('Using Gemini for copy generation...');
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert marketing copywriter. Create ${tone} content that directly relates to the campaign description provided. Always match the requested tone exactly.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: tone === 'casual' ? 0.8 : tone === 'enthusiastic' ? 0.9 : 0.7,
          maxOutputTokens: isEmail ? 800 : 500,
        }
      }),
    });

    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
        console.log('Gemini copy generation successful');
        return geminiData.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid Gemini response structure');
      }
    } else {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }
  } catch (error) {
    console.error('Copy generation error:', error);
    throw new Error(`Failed to generate copy content: ${error.message}`);
  }
}

export async function generateImageContent(
  platform: string,
  contentType: string,
  campaignData: CampaignData,
  aiSettings: AISettings
): Promise<{ content: string; mediaUrl: string; filePath?: string; fileSize?: number; mimeType?: string }> {
  const tone = aiSettings?.tone || 'professional';
  
  // Use custom image prompt if provided, otherwise use campaign description
  const customPrompt = aiSettings?.customImagePrompt;
  const imagePrompt = customPrompt ? 
    `${customPrompt}

Professional marketing photograph for "${campaignData.title}" campaign by ${campaignData.brand_name}.
Platform: ${platform} ${platform === 'instagram' ? 'square format' : 'landscape format'}
Brand Elements: ${campaignData.brand_name} style
Content: ${contentType} marketing visual
High-resolution commercial photography, professional lighting, compelling composition.` :
    `${campaignData.description || 'Premium brand experience'} 

Professional marketing photograph for "${campaignData.title}" campaign by ${campaignData.brand_name}.

Visual Style: ${tone === 'professional' ? 'Clean corporate aesthetic, modern office setting, business professionals, sharp lighting, minimalist design' : tone === 'casual' ? 'Lifestyle photography, natural environments, everyday people, warm soft lighting, approachable feel' : tone === 'enthusiastic' ? 'High energy, vibrant colors, dynamic action, excited people, bright dramatic lighting' : tone === 'humorous' ? 'Playful scene, bright cheerful colors, smiling people, fun interactions, uplifting atmosphere' : 'Premium modern design, sleek surfaces, sophisticated styling'}

Target: ${campaignData.target_audience || 'general audience'}
Platform: ${platform} ${platform === 'instagram' ? 'square format' : 'landscape format'}
Keywords: ${aiSettings?.keywords || 'quality, innovation'}
Brand Elements: ${campaignData.brand_name} style
Content: ${contentType} marketing visual

High-resolution commercial photography, professional lighting, compelling composition that represents: "${campaignData.description}"`;

  try {
    console.log('Generating image with Gemini AI, prompt:', imagePrompt);
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    console.log('Trying Gemini API for image generation...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: imagePrompt
        },
        safetySettings: [{
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }],
        generationConfig: {
          aspectRatio: "1:1",
          negativePrompt: "blurry, low quality, distorted, watermark, text overlay",
          seed: Math.floor(Math.random() * 1000000)
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Gemini image generation successful:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].image) {
        const imageData = data.candidates[0].image;
        
        // Upload to storage instead of returning base64
        let uploadResult: FileUploadResult;
        
        if (imageData.startsWith('data:')) {
          // Handle base64 data
          uploadResult = await uploadBase64ToStorage(
            imageData,
            campaignData.id,
            'image',
            'gemini',
            'imagen-3.0-generate-001',
            imagePrompt
          );
        } else {
          // Handle URL data (if Gemini returns URLs)
          const imageUrl = imageData.startsWith('http') ? imageData : `data:image/png;base64,${imageData}`;
          if (imageUrl.startsWith('http')) {
            uploadResult = await uploadUrlToStorage(
              imageUrl,
              campaignData.id,
              'image',
              'gemini',
              'imagen-3.0-generate-001',
              imagePrompt
            );
          } else {
            uploadResult = await uploadBase64ToStorage(
              imageUrl,
              campaignData.id,
              'image',
              'gemini',
              'imagen-3.0-generate-001',
              imagePrompt
            );
          }
        }
        
        return {
          content: `AI-generated ${tone} image for ${campaignData.brand_name} "${campaignData.title}" campaign (Gemini): ${campaignData.description}`,
          mediaUrl: uploadResult.publicUrl,
          filePath: uploadResult.filePath,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType
        };
      } else {
        throw new Error('Invalid Gemini image response structure');
      }
    } else {
      throw new Error(`Gemini image generation failed: ${response.status}`);
    }
  } catch (imageError) {
    console.error('AI image generation error:', imageError);
    throw new Error(`Failed to generate image content: ${imageError.message}`);
  }
}

export async function generateVideoContent(
  platform: string,
  contentType: string,
  campaignData: CampaignData,
  aiSettings: AISettings
): Promise<{ content: string; mediaUrl: string; filePath?: string; fileSize?: number; mimeType?: string }> {
  const tone = aiSettings?.tone || 'professional';
  
  // Use custom video prompt if provided, otherwise use default
  const customPrompt = aiSettings?.customVideoPrompt;
  const videoPrompt = customPrompt ? 
    `${customPrompt}

5-second professional marketing video for "${campaignData.title}" by ${campaignData.brand_name}.
Platform: ${platform} social media optimized
Target Audience: ${campaignData.target_audience || 'general audience'}
Video Format: 16:9 horizontal, high quality
Duration: exactly 5 seconds
High quality commercial video, modern, professional.` :
    `5-second professional marketing video for "${campaignData.title}" by ${campaignData.brand_name}.

CAMPAIGN FOCUS: ${campaignData.description || 'Premium brand experience'}

Visual Style: ${tone === 'professional' ? 'Corporate presentation, smooth camera work, office/business setting, clean transitions, product focus' : tone === 'casual' ? 'Lifestyle video, natural feel, everyday settings, warm lighting, people-focused' : tone === 'enthusiastic' ? 'High-energy montage, dynamic cuts, vibrant scenes, upbeat pacing' : tone === 'humorous' ? 'Comedy sketch style, playful scenarios, bright colorful setting' : 'Cinematic commercial, professional grade, dramatic lighting'}

Duration: exactly 5 seconds
Platform: ${platform} social media optimized
Target Audience: ${campaignData.target_audience || 'general audience'}
Video Format: 16:9 horizontal, high quality
Content Focus: ${campaignData.description}
Keywords to highlight: ${aiSettings?.keywords || 'quality, innovation'}`;

  try {
    console.log('Generating 5-second video for:', videoPrompt);
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    console.log('Attempting Gemini video generation...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-001:generateVideo?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: `${videoPrompt} Duration: exactly 5 seconds. High quality commercial video, modern, professional.`
        },
        safetySettings: [{
          category: "HARM_CATEGORY_DANGEROUS_CONTENT", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }],
        generationConfig: {
          duration: "5s",
          aspectRatio: "16:9",
          resolution: "720p",
          frameRate: 24,
          seed: Math.floor(Math.random() * 1000000),
          negativePrompt: "shaky camera, poor lighting, low quality, watermark",
          outputMimeType: "video/mp4"
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Gemini video generation successful:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].video) {
        const videoData = data.candidates[0].video;
        
        // Upload to storage instead of returning base64
        let uploadResult: FileUploadResult;
        
        if (videoData.startsWith('data:')) {
          // Handle base64 data
          uploadResult = await uploadBase64ToStorage(
            videoData,
            campaignData.id,
            'video',
            'gemini',
            'veo-001',
            videoPrompt
          );
        } else {
          // Handle URL data (if Gemini returns URLs)
          const videoUrl = videoData.startsWith('http') ? videoData : `data:video/mp4;base64,${videoData}`;
          if (videoUrl.startsWith('http')) {
            uploadResult = await uploadUrlToStorage(
              videoUrl,
              campaignData.id,
              'video',
              'gemini',
              'veo-001',
              videoPrompt
            );
          } else {
            uploadResult = await uploadBase64ToStorage(
              videoUrl,
              campaignData.id,
              'video',
              'gemini',
              'veo-001',
              videoPrompt
            );
          }
        }
        
        return {
          content: `🎬 5-SECOND AI VIDEO: "${campaignData.title}" - ${campaignData.description} (Generated with Gemini)`,
          mediaUrl: uploadResult.publicUrl,
          filePath: uploadResult.filePath,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType
        };
      } else {
        throw new Error('Invalid Gemini video response structure');
      }
    } else {
      throw new Error(`Gemini video generation failed: ${response.status}`);
    }
  } catch (videoError) {
    console.error('Video generation error:', videoError);
    throw new Error(`Failed to generate video content: ${videoError.message}`);
  }
}
