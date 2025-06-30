
import { CampaignData, AISettings } from './types.ts';
import { makeOpenAIRequest } from './openai-client.ts';

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
  
  const imagePrompt = `Create a ${contentType} image for ${campaignData.brand_name}'s "${campaignData.title}" campaign.
                     
                     CAMPAIGN CONTEXT (MUST REFLECT IN IMAGE):
                     - Brand: ${campaignData.brand_name}
                     - Campaign: ${campaignData.title}
                     - Description: ${campaignData.description || 'Premium brand experience'}
                     - Target audience: ${campaignData.target_audience || 'general audience'}
                     
                     VISUAL STYLE based on ${tone} tone:
                     ${tone === 'professional' ? 'Clean, corporate, business-focused design with professional color palette' :
                       tone === 'casual' ? 'Relaxed, friendly, approachable lifestyle photography with warm colors' :
                       tone === 'enthusiastic' ? 'Dynamic, energetic, vibrant colors with exciting visual elements' :
                       tone === 'informative' ? 'Clear, educational design with infographic elements' :
                       tone === 'humorous' ? 'Playful, fun, creative design with light-hearted elements' :
                       'High-quality, premium professional design'}
                     
                     Platform optimization: ${platform === 'instagram' ? 'Square 1:1 ratio, vibrant and social media ready' : 
                                           platform === 'linkedin' ? 'Professional business design, horizontal format' :
                                           platform === 'facebook' ? 'Engaging social design, horizontal format' :
                                           platform === 'twitter' ? 'Eye-catching, optimized for social sharing' :
                                           'Social media optimized, engaging visual'}
                     
                     Content focus: ${contentType === 'paid_ad' ? 'Promotional with clear value proposition' : 'Brand storytelling and lifestyle'}
                     
                     The image must visually represent: "${campaignData.description}"
                     Include elements related to: ${aiSettings?.keywords || 'quality, innovation'}
                     
                     High resolution, modern design, no text overlays, photorealistic.`;

  try {
    const imageResponse = await makeOpenAIRequest('https://api.openai.com/v1/images/generations', {
      model: 'dall-e-3',
      prompt: imagePrompt,
      size: platform === 'instagram' ? '1024x1024' : '1792x1024',
      quality: 'standard',
      n: 1,
    });

    if (imageResponse && imageResponse.ok) {
      const imageData = await imageResponse.json();
      if (imageData.data && imageData.data[0] && imageData.data[0].url) {
        return {
          content: `${tone} image for ${campaignData.brand_name} "${campaignData.title}" campaign - ${campaignData.description}`,
          mediaUrl: imageData.data[0].url
        };
      } else {
        throw new Error('Invalid image response structure');
      }
    } else {
      const errorText = await imageResponse?.text();
      console.error('Image generation failed:', errorText);
      throw new Error(`Image API error: ${imageResponse?.status}`);
    }
  } catch (imageError) {
    console.error('Image generation error:', imageError);
    return {
      content: `${tone} image concept for ${campaignData.brand_name} "${campaignData.title}" - ${campaignData.description} - optimized for ${platform} ${contentType}`,
      mediaUrl: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80`
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
  
  const videoPrompt = `Create a 15-second video script for ${campaignData.brand_name}'s "${campaignData.title}" campaign.
                     
                     CAMPAIGN FOCUS (SCRIPT MUST REFLECT):
                     - Brand: ${campaignData.brand_name}
                     - Campaign: ${campaignData.title}
                     - Description: ${campaignData.description || 'Premium brand experience'}
                     - Target: ${campaignData.target_audience || 'general audience'}
                     
                     TONE REQUIREMENT: Script must be ${tone}
                     ${tone === 'casual' ? 'Use friendly, conversational language' :
                       tone === 'enthusiastic' ? 'High energy, exciting delivery' :
                       tone === 'professional' ? 'Authoritative, business-focused' :
                       tone === 'humorous' ? 'Light-hearted, entertaining approach' :
                       tone === 'informative' ? 'Clear, educational presentation' :
                       'Professional and engaging'}
                     
                     15-SECOND STRUCTURE:
                     - 0-3s: Hook (attention grabber about the campaign)
                     - 3-12s: Core message (campaign description and benefits)
                     - 12-15s: Call-to-action
                     
                     Platform: ${platform} (${platform === 'instagram' ? 'Vertical format, Stories/Reels style' : 
                                            platform === 'twitter' ? 'Horizontal, Twitter-native' : 
                                            platform === 'linkedin' ? 'Professional, business-focused' :
                                            'Social media optimized'})
                     
                     Content Type: ${contentType} (${contentType === 'paid_ad' ? 'Include compelling offer and strong CTA' : 'Focus on brand story'})
                     
                     The video must showcase: "${campaignData.description}"
                     Keywords to highlight: ${aiSettings?.keywords || 'quality, innovation'}
                     
                     Provide: Scene-by-scene breakdown, dialogue/voiceover, visual descriptions, and timing.`;

  try {
    const scriptResponse = await makeOpenAIRequest('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are a video scriptwriter specializing in 15-second social media content. Create ${tone} scripts that directly relate to the campaign description. Keep it concise and impactful.` },
        { role: 'user', content: videoPrompt }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    if (scriptResponse && scriptResponse.ok) {
      const scriptData = await scriptResponse.json();
      if (scriptData.choices && scriptData.choices[0] && scriptData.choices[0].message) {
        return {
          content: `[15-Second ${tone} Video Script for ${campaignData.brand_name}]\n\n${scriptData.choices[0].message.content}\n\n🎬 Optimized for ${platform} ${contentType}`,
          mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        };
      } else {
        throw new Error('Invalid script response structure');
      }
    } else {
      throw new Error(`Script API error: ${scriptResponse?.status}`);
    }
  } catch (scriptError) {
    console.error('Video script generation error:', scriptError);
    
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
⏱️ DURATION: 15 seconds

📋 SCRIPT BREAKDOWN:

🎣 HOOK (0-3s): 
"${tone === 'casual' ? 'Hey! Check this out...' : 
    tone === 'enthusiastic' ? 'This is AMAZING!' :
    tone === 'humorous' ? 'You won\'t believe this...' :
    'Introducing something special...'}"
Visual: Dynamic opening with ${campaignData.brand_name} branding

💡 CORE MESSAGE (3-12s):
"${campaignData.description || 'Experience the difference with our premium solution'}"
Target: ${campaignData.target_audience || 'Perfect for everyone'}
Visual: Product/service showcase demonstrating the campaign concept

📞 CTA (12-15s): 
"${contentType === 'paid_ad' ? 'Get yours now!' : 'Learn more today!'}"
Visual: Clear call-to-action with brand logo

🎵 AUDIO: ${toneDirection} background music
📝 KEYWORDS: ${aiSettings?.keywords || 'quality, innovation'}
✨ Platform optimized for ${platform}`,
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    };
  }
}
