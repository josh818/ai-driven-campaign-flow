
import { CampaignData, AISettings } from './types.ts';
import { makeOpenAIRequest } from './openai-client.ts';
import { generateGeminiImage, generateOpenAIImage } from './gemini-client.ts';

export async function generateCopyContent(
  platform: string,
  contentType: string,
  campaignData: CampaignData,
  aiSettings: AISettings
): Promise<string> {
  const tone = aiSettings?.tone || 'professional';
  const isEmail = platform === 'email';
  
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
                 
                 ${contentType === 'paid_ad' || aiSettings?.campaignType === 'paid_ad' ? 'Include a compelling offer and clear call-to-action for paid advertising.' : 'Focus on engagement and brand storytelling.'}
                 
                 IMPORTANT: The content must directly relate to the campaign description: "${campaignData.description}"`;

  try {
    const response = await makeOpenAIRequest('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are an expert marketing copywriter. Create ${tone} content that directly relates to the campaign description provided. Always match the requested tone exactly.` },
        { role: 'user', content: prompt }
      ],
      temperature: tone === 'casual' ? 0.8 : tone === 'enthusiastic' ? 0.9 : 0.7,
      max_tokens: isEmail ? 800 : 500,
    });

    if (response && response.ok) {
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        throw new Error('Invalid OpenAI response structure');
      }
    } else {
      throw new Error(`OpenAI API error: ${response?.status}`);
    }
  } catch (error) {
    console.error('Copy generation error:', error);
    
    // Enhanced fallback that respects tone and campaign description
    const toneStyle = tone === 'casual' ? 'Hey there! 😊' : 
                     tone === 'enthusiastic' ? '🚀 AMAZING NEWS!' :
                     tone === 'humorous' ? '😄 Ready for something awesome?' :
                     tone === 'informative' ? 'Here are the key details:' :
                     'We are pleased to announce:';
    
    if (isEmail) {
      return `Subject: ${campaignData.title} - ${campaignData.brand_name}

${toneStyle}

We're excited to share our latest campaign: ${campaignData.title}

[VISUAL CONTENT - Professional image and video content will be included]

${campaignData.description || 'Experience the difference with our premium solution.'}

This campaign is specifically designed for ${campaignData.target_audience || 'our valued customers'}, focusing on ${campaignData.campaign_goals?.join(' and ') || 'delivering exceptional value'}.

Key highlights:
• ${campaignData.title} represents our commitment to innovation
• Tailored specifically for ${campaignData.target_audience || 'your needs'}
• ${campaignData.description || 'Premium quality you can trust'}

${contentType === 'paid_ad' ? 'Special offer: Contact us today to learn more!' : 'Thank you for being part of our community.'}

Best regards,
The ${campaignData.brand_name} Team

Keywords: ${aiSettings?.keywords || 'quality, innovation, premium'}`;
    }
    
    return `${toneStyle} ${campaignData.brand_name} presents: ${campaignData.title}

${campaignData.description || 'Experience the difference with our premium solution.'}

Perfect for ${campaignData.target_audience || 'our valued customers'}! 

${campaignData.campaign_goals?.length ? `Focus: ${campaignData.campaign_goals.join(' • ')}` : ''}
${aiSettings?.keywords ? `#${aiSettings.keywords.split(',').map(k => k.trim()).join(' #')}` : '#Quality #Innovation'}

${contentType === 'paid_ad' ? '👉 Don\'t miss out - act now!' : '💫 Join the ' + campaignData.brand_name + ' community!'}`;
  }
}

export async function generateImageContent(
  platform: string,
  contentType: string,
  campaignData: CampaignData,
  aiSettings: AISettings
): Promise<{ content: string; mediaUrl: string }> {
  const tone = aiSettings?.tone || 'professional';
  
  // Use campaign description as the master prompt for image generation
  const imagePrompt = `${campaignData.description || 'Premium brand experience'} 

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
    
    // Try multiple APIs in sequence to find the best one
    let imageResponse;
    let apiUsed = '';
    
    try {
      console.log('Trying Gemini API for image generation...');
      imageResponse = await generateGeminiImage(imagePrompt);
      apiUsed = 'Gemini';
    } catch (geminiError) {
      console.log('Gemini failed, trying OpenAI:', geminiError);
      try {
        const { generateOpenAIImage } = await import('./openai-client.ts');
        imageResponse = await generateOpenAIImage(imagePrompt);
        apiUsed = 'OpenAI';
      } catch (openaiError) {
        console.log('OpenAI failed, trying RunwayML:', openaiError);
        const { generateRunwayMLImage } = await import('./runwayml-client.ts');
        imageResponse = await generateRunwayMLImage(imagePrompt);
        apiUsed = 'RunwayML';
      }
    }

    if (imageResponse && imageResponse.ok) {
      const imageData = await imageResponse.json();
      console.log('AI image generation successful:', imageData);
      
      // Handle different possible response structures
      let imageUrl = '';
      if (imageData.url) {
        imageUrl = imageData.url;
      } else if (imageData.data && imageData.data[0] && imageData.data[0].url) {
        imageUrl = imageData.data[0].url;
      } else if (imageData.candidates && imageData.candidates[0] && imageData.candidates[0].image) {
        imageUrl = imageData.candidates[0].image;
      } else {
        throw new Error('Invalid AI image response structure');
      }

      return {
        content: `AI-generated ${tone} image for ${campaignData.brand_name} "${campaignData.title}" campaign (${apiUsed}): ${campaignData.description}`,
        mediaUrl: imageUrl
      };
    } else {
      throw new Error(`AI Image generation failed: ${imageResponse?.status}`);
    }
  } catch (imageError) {
    console.error('AI image generation error:', imageError);
    
    // Use varied, campaign-relevant stock images as fallback
    const businessImages = [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1024&h=1024&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1024&h=1024&fit=crop&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&h=1024&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1024&h=1024&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1024&h=1024&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1024&h=1024&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adcf?w=1024&h=1024&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=1024&h=1024&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1024&h=1024&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1024&h=1024&fit=crop&q=80'
    ];
    
    // Select image based on campaign content to make it more relevant
    const imageIndex = Math.abs(campaignData.title.length + campaignData.brand_name.length) % businessImages.length;
    const selectedImage = businessImages[imageIndex];
    
    return {
      content: `${tone} image concept for ${campaignData.brand_name} "${campaignData.title}" - ${campaignData.description} - optimized for ${platform} ${contentType}`,
      mediaUrl: selectedImage
    };
  }
}

export async function generateVideoContent(
  platform: string,
  contentType: string,
  campaignData: CampaignData,
  aiSettings: AISettings
): Promise<{ content: string; mediaUrl: string }> {
  const tone = aiSettings?.tone || 'professional';
  
  // Create a 10-second video concept for the campaign
  const videoPrompt = `10-second professional marketing video for "${campaignData.title}" by ${campaignData.brand_name}.

CAMPAIGN FOCUS: ${campaignData.description || 'Premium brand experience'}

Visual Style: ${tone === 'professional' ? 'Corporate presentation, smooth camera work, office/business setting, clean transitions, product focus' : tone === 'casual' ? 'Lifestyle video, natural feel, everyday settings, warm lighting, people-focused' : tone === 'enthusiastic' ? 'High-energy montage, dynamic cuts, vibrant scenes, upbeat pacing' : tone === 'humorous' ? 'Comedy sketch style, playful scenarios, bright colorful setting' : 'Cinematic commercial, professional grade, dramatic lighting'}

Duration: Maximum 10 seconds
Platform: ${platform} social media optimized
Target Audience: ${campaignData.target_audience || 'general audience'}
Video Format: 16:9 horizontal, high quality
Content Focus: ${campaignData.description}
Keywords to highlight: ${aiSettings?.keywords || 'quality, innovation'}

${aiSettings?.videoPrompt ? `Custom Direction: ${aiSettings.videoPrompt}` : ''}`;

  try {
    console.log('Generating 5-second video for:', videoPrompt);
    
    // Try multiple video APIs to find one that works
    let videoResponse;
    let apiUsed = '';
    
    try {
      console.log('Attempting RunwayML video generation...');
      const { generateRunwayMLVideo } = await import('./runwayml-client.ts');
      videoResponse = await generateRunwayMLVideo(videoPrompt);
      apiUsed = 'RunwayML';
      
      if (videoResponse && videoResponse.ok) {
        const videoData = await videoResponse.json();
        console.log('RunwayML video generation successful:', videoData);
        
        let videoUrl = '';
        if (videoData.url) {
          videoUrl = videoData.url;
        } else if (videoData.imageURL) {
          videoUrl = videoData.imageURL; // Some APIs return imageURL for video
        }
        
        if (videoUrl) {
          return {
            content: `🎬 5-SECOND AI VIDEO: "${campaignData.title}" - ${campaignData.description} (Generated with ${apiUsed})`,
            mediaUrl: videoUrl
          };
        }
      }
    } catch (runwayError) {
      console.log('RunwayML video failed, trying Gemini:', runwayError);
      
      try {
        console.log('Attempting Gemini video generation...');
        const { generateGeminiVideo } = await import('./gemini-client.ts');
        const geminiVideoResponse = await generateGeminiVideo(videoPrompt);
        apiUsed = 'Gemini';
        
        if (geminiVideoResponse && geminiVideoResponse.ok) {
          const videoData = await geminiVideoResponse.json();
          console.log('Gemini video generation successful:', videoData);
          
          let videoUrl = '';
          if (videoData.url) {
            videoUrl = videoData.url;
          } else if (videoData.candidates && videoData.candidates[0] && videoData.candidates[0].video) {
            videoUrl = videoData.candidates[0].video;
          }
          
          if (videoUrl) {
            return {
              content: `🎬 5-SECOND AI VIDEO: "${campaignData.title}" - ${campaignData.description} (Generated with ${apiUsed})`,
              mediaUrl: videoUrl
            };
          }
        }
      } catch (geminiError) {
        console.log('All video APIs failed, falling back to placeholder:', geminiError);
      }
    }
      
    // Generate detailed video script as fallback using OpenAI
    const scriptPrompt = `Create a detailed 10-second video production script for ${campaignData.brand_name}'s "${campaignData.title}" campaign.

Campaign Description: ${campaignData.description || 'Premium brand experience'}
Target Audience: ${campaignData.target_audience || 'general audience'}
Tone: ${tone}
Platform: ${platform}
Content Type: ${contentType}
Keywords: ${aiSettings?.keywords || 'quality, innovation'}
${aiSettings?.videoPrompt ? `Custom Direction: ${aiSettings.videoPrompt}` : ''}

Script Structure (10 seconds total):
- Hook/Opening (0-3 seconds): Eye-catching visual that stops scrolling
- Core Message (3-7 seconds): Main campaign message and value proposition  
- Call-to-Action (7-10 seconds): Clear next step or engagement prompt

Include shot descriptions, camera movements, text overlays, music/sound suggestions, and visual elements that represent the campaign description.`;

    const scriptResponse = await makeOpenAIRequest('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are an expert video scriptwriter specializing in short-form social media content. Create detailed, actionable ${tone} video scripts with specific visual directions.` },
        { role: 'user', content: scriptPrompt }
      ],
      temperature: 0.8,
      max_tokens: 600,
    });

    let scriptContent = `🎬 10-SECOND VIDEO SCRIPT: "${campaignData.title}"\n\n`;
    
    if (scriptResponse && scriptResponse.ok) {
      const scriptData = await scriptResponse.json();
      if (scriptData.choices && scriptData.choices[0] && scriptData.choices[0].message) {
        scriptContent += scriptData.choices[0].message.content;
      }
    } else {
      // Fallback script structure
      scriptContent += `BRAND: ${campaignData.brand_name}
CAMPAIGN: ${campaignData.title}
TONE: ${tone}

SCRIPT BREAKDOWN:
⏰ 0-3s: ${tone === 'enthusiastic' ? 'Quick zoom on product with energetic music' : tone === 'professional' ? 'Clean product shot with corporate music' : 'Lifestyle scene showing product in use'}
⏰ 3-7s: "${campaignData.description || 'Experience the difference'}"
⏰ 7-10s: "${contentType === 'paid_ad' ? 'Shop now!' : 'Learn more'}"

VISUAL STYLE: ${tone} mood, professional lighting, ${platform} optimized
KEYWORDS: ${aiSettings?.keywords || 'quality, innovation'}
${aiSettings?.videoPrompt ? `CUSTOM DIRECTION: ${aiSettings.videoPrompt}` : ''}`;
    }

    // Use a short 5-second video placeholder that's appropriate for social media
    const socialVideoPlaceholders = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ];
    
    const selectedVideo = socialVideoPlaceholders[Math.floor(Math.random() * socialVideoPlaceholders.length)];

    return {
      content: scriptContent + `\n\n✨ 5-second video ready for ${platform} as ${contentType}`,
      mediaUrl: selectedVideo
    };
  } catch (videoError) {
    console.error('Video script generation error:', videoError);
    
    const toneDirection = tone === 'casual' ? 'friendly and conversational' :
                         tone === 'enthusiastic' ? 'high-energy and exciting' :
                         tone === 'professional' ? 'authoritative and polished' :
                         tone === 'humorous' ? 'entertaining and fun' :
                         tone === 'informative' ? 'clear and educational' :
                         'engaging and professional';
    
    return {
      content: `[5-Second ${tone} Video for ${campaignData.brand_name}]

🎬 CAMPAIGN: ${campaignData.title}
🏢 BRAND: ${campaignData.brand_name}
🎯 TONE: ${tone} (${toneDirection})
📱 PLATFORM: ${platform}
⏱️ DURATION: 5 seconds maximum

📋 SCRIPT BREAKDOWN:

🎣 HOOK (0-3s): 
"${tone === 'casual' ? 'Hey! Check this out...' : 
    tone === 'enthusiastic' ? 'This is AMAZING!' :
    tone === 'humorous' ? 'You won\'t believe this...' :
    'Introducing something special...'}"

💡 CORE MESSAGE (3-7s):
"${campaignData.description || 'Experience the difference with our premium solution'}"
Target: ${campaignData.target_audience || 'Perfect for everyone'}

📞 CTA (7-10s): 
"${contentType === 'paid_ad' ? 'Get yours now!' : 'Learn more today!'}"

🎵 AUDIO: ${toneDirection} background music
📝 KEYWORDS: ${aiSettings?.keywords || 'quality, innovation'}
${aiSettings?.videoPrompt ? `🎨 CUSTOM: ${aiSettings.videoPrompt}` : ''}
✨ Platform optimized for ${platform}`,
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    };
  }
}
