
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
                 - Focus on the campaign description: ${campaignData.description}` : ''}
                 
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
  const imagePrompt = `Create a ${tone} marketing image for ${campaignData.brand_name} campaign "${campaignData.title}". 
                     
                     SPECIFIC REQUIREMENTS:
                     - Campaign focus: ${campaignData.description || 'Premium brand experience'}
                     - Brand: ${campaignData.brand_name}
                     - Target audience: ${campaignData.target_audience || 'general audience'}
                     - Goals: ${campaignData.campaign_goals?.join(', ') || 'brand awareness'}
                     
                     VISUAL STYLE: ${tone === 'professional' ? 'Clean, corporate, modern business aesthetic with blue and teal colors' : 
                                    tone === 'casual' ? 'Friendly, approachable, lifestyle-focused with warm colors' :
                                    tone === 'enthusiastic' ? 'Energetic, vibrant, dynamic with bright colors and movement' :
                                    tone === 'humorous' ? 'Playful, fun, entertaining with colorful and lighthearted elements' :
                                    'Modern, professional, sleek design with blue and teal brand colors'}
                     
                     TECHNICAL SPECS:
                     - High-quality, photorealistic
                     - ${platform === 'instagram' ? 'Square format (1:1 ratio)' : 'Horizontal format (16:9 ratio)'}
                     - Social media optimized
                     - Include brand elements if possible
                     
                     KEYWORDS TO INCORPORATE VISUALLY: ${aiSettings?.keywords || 'quality, innovation, premium'}
                     
                     MUST REFLECT: ${campaignData.description || 'Premium brand experience'}`;

  try {
    console.log('Generating image with RunwayML, prompt:', imagePrompt);
    const imageResponse = await generateRunwayMLImage(imagePrompt);

    if (imageResponse && imageResponse.ok) {
      const imageData = await imageResponse.json();
      console.log('RunwayML image response:', imageData);
      
      if (imageData.data && imageData.data[0] && imageData.data[0].url) {
        return {
          content: `Professional ${tone} image for ${campaignData.brand_name} "${campaignData.title}" campaign showcasing: ${campaignData.description}`,
          mediaUrl: imageData.data[0].url
        };
      } else if (imageData.url) {
        return {
          content: `Professional ${tone} image for ${campaignData.brand_name} "${campaignData.title}" campaign showcasing: ${campaignData.description}`,
          mediaUrl: imageData.url
        };
      } else {
        throw new Error('Invalid RunwayML image response structure');
      }
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
  
  // Create specific video prompt for RunwayML (max 15 seconds)
  const videoPrompt = `Create a 15-second ${tone} marketing video for ${campaignData.brand_name} campaign "${campaignData.title}".
                     
                     CAMPAIGN SPECIFICS:
                     - Brand: ${campaignData.brand_name}
                     - Focus: ${campaignData.description || 'Premium brand experience'}
                     - Target: ${campaignData.target_audience || 'general audience'}
                     - Goals: ${campaignData.campaign_goals?.join(', ') || 'brand awareness'}
                     
                     VIDEO STYLE: ${tone === 'professional' ? 'Corporate, clean, business-focused with blue/teal brand colors' : 
                                   tone === 'casual' ? 'Friendly, lifestyle, approachable with warm natural lighting' :
                                   tone === 'enthusiastic' ? 'Energetic, dynamic, exciting with fast-paced movement' :
                                   tone === 'humorous' ? 'Playful, entertaining, fun with bright colors' :
                                   'Modern, engaging, professional with contemporary design'}
                     
                     TECHNICAL REQUIREMENTS:
                     - Duration: exactly 15 seconds maximum
                     - Aspect ratio: 16:9 (1280x720)
                     - High-definition quality
                     - Social media optimized
                     
                     CONTENT FOCUS: ${campaignData.description || 'Premium brand experience'}
                     KEYWORDS: ${aiSettings?.keywords || 'quality, innovation'}`;

  try {
    console.log('Generating video with RunwayML, prompt:', videoPrompt);
    const videoResponse = await generateRunwayMLVideo(videoPrompt);

    if (videoResponse && videoResponse.ok) {
      const videoData = await videoResponse.json();
      console.log('RunwayML video response:', videoData);
      
      // Generate script as well
      const scriptPrompt = `Create a 15-second video script for ${campaignData.brand_name}'s "${campaignData.title}" campaign.
                         
                         CAMPAIGN FOCUS (SCRIPT MUST REFLECT):
                         - Brand: ${campaignData.brand_name}
                         - Campaign: ${campaignData.title}
                         - Description: ${campaignData.description || 'Premium brand experience'}
                         - Target: ${campaignData.target_audience || 'general audience'}
                         
                         TONE REQUIREMENT: Script must be ${tone}
                         
                         15-SECOND STRUCTURE:
                         - 0-5s: Hook (attention grabber)
                         - 5-12s: Core message (campaign benefits)
                         - 12-15s: Call-to-action
                         
                         Platform: ${platform} ${contentType}
                         Keywords: ${aiSettings?.keywords || 'quality, innovation'}`;

      const scriptResponse = await makeOpenAIRequest('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a video scriptwriter specializing in 15-second social media content. Create ${tone} scripts.` },
          { role: 'user', content: scriptPrompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      let scriptContent = `[15-Second ${tone} Video for ${campaignData.brand_name}]\n\n`;
      
      if (scriptResponse && scriptResponse.ok) {
        const scriptData = await scriptResponse.json();
        if (scriptData.choices && scriptData.choices[0] && scriptData.choices[0].message) {
          scriptContent += scriptData.choices[0].message.content;
        }
      }

      // Handle different possible response structures from RunwayML
      let videoUrl = '';
      if (videoData.data && videoData.data[0] && videoData.data[0].url) {
        videoUrl = videoData.data[0].url;
      } else if (videoData.url) {
        videoUrl = videoData.url;
      } else {
        throw new Error('Invalid RunwayML video response structure');
      }

      return {
        content: scriptContent + `\n\n🎬 15-second video generated with RunwayML for ${platform} ${contentType}`,
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
      content: `[15-Second ${tone} Video Script for ${campaignData.brand_name}]

🎬 CAMPAIGN: ${campaignData.title}
🏢 BRAND: ${campaignData.brand_name}
🎯 TONE: ${tone} (${toneDirection})
📱 PLATFORM: ${platform}
⏱️ DURATION: 15 seconds maximum

📋 SCRIPT BREAKDOWN:

🎣 HOOK (0-5s): 
"${tone === 'casual' ? 'Hey! Check this out...' : 
    tone === 'enthusiastic' ? 'This is AMAZING!' :
    tone === 'humorous' ? 'You won\'t believe this...' :
    'Introducing something special...'}"

💡 CORE MESSAGE (5-12s):
"${campaignData.description || 'Experience the difference with our premium solution'}"
Target: ${campaignData.target_audience || 'Perfect for everyone'}

📞 CTA (12-15s): 
"${contentType === 'paid_ad' ? 'Get yours now!' : 'Learn more today!'}"

🎵 AUDIO: ${toneDirection} background music
📝 KEYWORDS: ${aiSettings?.keywords || 'quality, innovation'}
✨ Platform optimized for ${platform}`,
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    };
  }
}
