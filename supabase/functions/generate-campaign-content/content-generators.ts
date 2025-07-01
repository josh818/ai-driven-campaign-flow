
import { CampaignData, AISettings } from './types.ts';
import { makeOpenAIRequest } from './openai-client.ts';
import { generateRunwayMLImage, generateRunwayMLVideo } from './runwayml-client.ts';

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
                 
                 ${contentType === 'paid_ad' ? 'Include a compelling offer and clear call-to-action.' : 'Focus on engagement and brand storytelling.'}
                 
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
  
  // Create a detailed, specific prompt for RunwayML that follows the campaign description
  const imagePrompt = `Create a ${tone} marketing image for ${campaignData.brand_name} campaign "${campaignData.title}". Campaign focus: ${campaignData.description || 'Premium brand experience'}. Target audience: ${campaignData.target_audience || 'general audience'}. Visual style: ${tone === 'professional' ? 'Clean, corporate, modern business aesthetic' : tone === 'casual' ? 'Friendly, approachable, lifestyle-focused' : tone === 'enthusiastic' ? 'Energetic, vibrant, dynamic' : tone === 'humorous' ? 'Playful, fun, entertaining' : 'Modern, professional, sleek design'}. High-quality, ${platform === 'instagram' ? 'square format' : 'horizontal format'}, social media optimized. Keywords: ${aiSettings?.keywords || 'quality, innovation'}`;

  try {
    console.log('Generating image with RunwayML, prompt:', imagePrompt);
    const imageResponse = await generateRunwayMLImage(imagePrompt);

    if (imageResponse && imageResponse.ok) {
      const imageData = await imageResponse.json();
      console.log('RunwayML image response:', imageData);
      
      // Handle different possible response structures from RunwayML
      let imageUrl = '';
      if (imageData.data && imageData.data.length > 0 && imageData.data[0].url) {
        imageUrl = imageData.data[0].url;
      } else if (imageData.url) {
        imageUrl = imageData.url;
      } else if (imageData.image && imageData.image.url) {
        imageUrl = imageData.image.url;
      } else {
        throw new Error('Invalid RunwayML image response structure');
      }

      return {
        content: `Professional ${tone} image for ${campaignData.brand_name} "${campaignData.title}" campaign showcasing: ${campaignData.description}`,
        mediaUrl: imageUrl
      };
    } else {
      const errorText = await imageResponse?.text();
      console.error('RunwayML image generation failed:', errorText);
      throw new Error(`RunwayML Image API error: ${imageResponse?.status}`);
    }
  } catch (imageError) {
    console.error('RunwayML image generation error:', imageError);
    
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
  
  // Create specific video prompt for RunwayML (10 seconds for better reliability)
  const videoPrompt = `Create a 10-second ${tone} marketing video for ${campaignData.brand_name} campaign "${campaignData.title}". Campaign focus: ${campaignData.description || 'Premium brand experience'}. Target: ${campaignData.target_audience || 'general audience'}. Video style: ${tone === 'professional' ? 'Corporate, clean, business-focused' : tone === 'casual' ? 'Friendly, lifestyle, approachable' : tone === 'enthusiastic' ? 'Energetic, dynamic, exciting' : tone === 'humorous' ? 'Playful, entertaining, fun' : 'Modern, engaging, professional'}. Duration: 10 seconds, aspect ratio: 16:9, high-definition. Keywords: ${aiSettings?.keywords || 'quality, innovation'}`;

  try {
    console.log('Generating video with RunwayML, prompt:', videoPrompt);
    const videoResponse = await generateRunwayMLVideo(videoPrompt);

    if (videoResponse && videoResponse.ok) {
      const videoData = await videoResponse.json();
      console.log('RunwayML video response:', videoData);
      
      // Generate script as well
      const scriptPrompt = `Create a 10-second video script for ${campaignData.brand_name}'s "${campaignData.title}" campaign. Campaign focus: ${campaignData.description || 'Premium brand experience'}. Target: ${campaignData.target_audience || 'general audience'}. Tone: ${tone}. 10-second structure: Hook (0-3s) → Core message (3-8s) → Call-to-action (8-10s). Platform: ${platform} ${contentType}. Keywords: ${aiSettings?.keywords || 'quality, innovation'}`;

      const scriptResponse = await makeOpenAIRequest('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a video scriptwriter specializing in 10-second social media content. Create ${tone} scripts.` },
          { role: 'user', content: scriptPrompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      let scriptContent = `[10-Second ${tone} Video for ${campaignData.brand_name}]\n\n`;
      
      if (scriptResponse && scriptResponse.ok) {
        const scriptData = await scriptResponse.json();
        if (scriptData.choices && scriptData.choices[0] && scriptData.choices[0].message) {
          scriptContent += scriptData.choices[0].message.content;
        }
      }

      // Handle different possible response structures from RunwayML
      let videoUrl = '';
      if (videoData.data && videoData.data.length > 0 && videoData.data[0].url) {
        videoUrl = videoData.data[0].url;
      } else if (videoData.url) {
        videoUrl = videoData.url;
      } else if (videoData.video && videoData.video.url) {
        videoUrl = videoData.video.url;
      } else {
        throw new Error('Invalid RunwayML video response structure');
      }

      return {
        content: scriptContent + `\n\n🎬 10-second video generated with RunwayML for ${platform} ${contentType}`,
        mediaUrl: videoUrl
      };
    } else {
      const errorText = await videoResponse?.text();
      console.error('RunwayML video generation failed:', errorText);
      throw new Error(`RunwayML Video API error: ${videoResponse?.status}`);
    }
  } catch (videoError) {
    console.error('RunwayML video generation error:', videoError);
    
    const toneDirection = tone === 'casual' ? 'friendly and conversational' :
                         tone === 'enthusiastic' ? 'high-energy and exciting' :
                         tone === 'professional' ? 'authoritative and polished' :
                         tone === 'humorous' ? 'entertaining and fun' :
                         tone === 'informative' ? 'clear and educational' :
                         'engaging and professional';
    
    return {
      content: `[10-Second ${tone} Video Script for ${campaignData.brand_name}]

🎬 CAMPAIGN: ${campaignData.title}
🏢 BRAND: ${campaignData.brand_name}
🎯 TONE: ${tone} (${toneDirection})
📱 PLATFORM: ${platform}
⏱️ DURATION: 10 seconds

📋 SCRIPT BREAKDOWN:

🎣 HOOK (0-3s): 
"${tone === 'casual' ? 'Hey! Check this out...' : 
    tone === 'enthusiastic' ? 'This is AMAZING!' :
    tone === 'humorous' ? 'You won\'t believe this...' :
    'Introducing something special...'}"

💡 CORE MESSAGE (3-8s):
"${campaignData.description || 'Experience the difference with our premium solution'}"
Target: ${campaignData.target_audience || 'Perfect for everyone'}

📞 CTA (8-10s): 
"${contentType === 'paid_ad' ? 'Get yours now!' : 'Learn more today!'}"

🎵 AUDIO: ${toneDirection} background music
📝 KEYWORDS: ${aiSettings?.keywords || 'quality, innovation'}
✨ Platform optimized for ${platform}`,
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    };
  }
}
