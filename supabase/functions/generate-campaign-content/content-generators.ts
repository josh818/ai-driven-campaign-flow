
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
                 - Include placeholder for image: [IMAGE PLACEHOLDER - Campaign visual will be inserted here]` : ''}
                 
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

[IMAGE PLACEHOLDER - Campaign visual will be inserted here]

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
  
  // Create a detailed, specific prompt for AI image generation that follows the campaign description
  const imagePrompt = `Professional marketing photograph for "${campaignData.title}" campaign by ${campaignData.brand_name}. 

CAMPAIGN FOCUS: ${campaignData.description || 'Premium brand experience'}

Visual Style: ${tone === 'professional' ? 'Clean corporate aesthetic, modern office setting, business professionals, sharp lighting, minimalist design' : tone === 'casual' ? 'Lifestyle photography, natural environments, everyday people, warm soft lighting, approachable feel' : tone === 'enthusiastic' ? 'High energy, vibrant colors, dynamic action, excited people, bright dramatic lighting' : tone === 'humorous' ? 'Playful scene, bright cheerful colors, smiling people, fun interactions, uplifting atmosphere' : 'Premium modern design, sleek surfaces, sophisticated styling'}

Target: ${campaignData.target_audience || 'general audience'}
Platform: ${platform} ${platform === 'instagram' ? 'square format' : 'landscape format'}
Keywords: ${aiSettings?.keywords || 'quality, innovation'}
Brand Elements: ${campaignData.brand_name} style
Content: ${contentType} marketing visual

High-resolution commercial photography, professional lighting, compelling composition that represents: "${campaignData.description}"`;

  try {
    console.log('Generating image with Gemini AI, prompt:', imagePrompt);
    
    // Try Gemini first, fallback to OpenAI
    let imageResponse;
    try {
      imageResponse = await generateGeminiImage(imagePrompt);
    } catch (geminiError) {
      console.log('Gemini failed, trying OpenAI:', geminiError);
      imageResponse = await generateOpenAIImage(imagePrompt);
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
        content: `AI-generated ${tone} image for ${campaignData.brand_name} "${campaignData.title}" campaign: ${campaignData.description}`,
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
  
  // Create a 5-second video concept for the campaign
  const videoPrompt = `5-second marketing video concept for "${campaignData.title}" by ${campaignData.brand_name}.

CAMPAIGN: ${campaignData.description || 'Premium brand experience'}

Video Style: ${tone === 'professional' ? 'Corporate presentation, smooth camera work, office/business setting, clean transitions' : tone === 'casual' ? 'Lifestyle video, handheld feel, everyday settings, natural lighting' : tone === 'enthusiastic' ? 'High-energy montage, quick cuts, vibrant scenes, upbeat pacing' : tone === 'humorous' ? 'Comedy sketch style, playful scenarios, bright colorful setting' : 'Cinematic commercial, professional grade, dramatic lighting'}

Duration: Exactly 5 seconds
Platform: ${platform} social media
Target: ${campaignData.target_audience || 'general audience'}
Format: 16:9 horizontal video
Keywords: ${aiSettings?.keywords || 'quality, innovation'}

The video must showcase: "${campaignData.description}"`;

  try {
    console.log('Generating video concept for:', videoPrompt);
    
    // For now, we'll generate a detailed video script since Gemini video API requires special access
    // and create a placeholder video URL
      
    // Generate detailed video script using OpenAI
    const scriptPrompt = `Create a detailed 5-second video production script for ${campaignData.brand_name}'s "${campaignData.title}" campaign.

Campaign Description: ${campaignData.description || 'Premium brand experience'}
Target Audience: ${campaignData.target_audience || 'general audience'}
Tone: ${tone}
Platform: ${platform}
Content Type: ${contentType}
Keywords: ${aiSettings?.keywords || 'quality, innovation'}

Script Structure (5 seconds total):
- Hook/Opening (0-2 seconds): Eye-catching visual that stops scrolling
- Core Message (2-4 seconds): Main campaign message and value proposition  
- Call-to-Action (4-5 seconds): Clear next step or engagement prompt

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

    let scriptContent = `🎬 5-SECOND VIDEO SCRIPT: "${campaignData.title}"\n\n`;
    
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
⏰ 0-2s: ${tone === 'enthusiastic' ? 'Quick zoom on product with energetic music' : tone === 'professional' ? 'Clean product shot with corporate music' : 'Lifestyle scene showing product in use'}
⏰ 2-4s: "${campaignData.description || 'Experience the difference'}"
⏰ 4-5s: "${contentType === 'paid_ad' ? 'Shop now!' : 'Learn more'}"

VISUAL STYLE: ${tone} mood, professional lighting, ${platform} optimized
KEYWORDS: ${aiSettings?.keywords || 'quality, innovation'}`;
    }

    // Use a short 5-second video placeholder that's appropriate for social media
    const socialVideoPlaceholders = [
      'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
      'https://filesamples.com/samples/video/mp4/SampleVideo_360x240_5mb.mp4'
    ];
    
    const selectedVideo = socialVideoPlaceholders[Math.floor(Math.random() * socialVideoPlaceholders.length)];

    return {
      content: scriptContent + `\n\n✨ Ready for production on ${platform} as ${contentType}`,
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
      content: `[5-Second ${tone} Video Script for ${campaignData.brand_name}]

🎬 CAMPAIGN: ${campaignData.title}
🏢 BRAND: ${campaignData.brand_name}
🎯 TONE: ${tone} (${toneDirection})
📱 PLATFORM: ${platform}
⏱️ DURATION: 5 seconds

📋 SCRIPT BREAKDOWN:

🎣 HOOK (0-2s): 
"${tone === 'casual' ? 'Hey! Check this out...' : 
    tone === 'enthusiastic' ? 'This is AMAZING!' :
    tone === 'humorous' ? 'You won\'t believe this...' :
    'Introducing something special...'}"

💡 CORE MESSAGE (2-4s):
"${campaignData.description || 'Experience the difference with our premium solution'}"
Target: ${campaignData.target_audience || 'Perfect for everyone'}

📞 CTA (4-5s): 
"${contentType === 'paid_ad' ? 'Get yours now!' : 'Learn more today!'}"

🎵 AUDIO: ${toneDirection} background music
📝 KEYWORDS: ${aiSettings?.keywords || 'quality, innovation'}
✨ Platform optimized for ${platform}`,
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    };
  }
}
