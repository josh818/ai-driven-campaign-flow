
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
  
  // Create a detailed prompt for RunwayML
  const imagePrompt = `Professional marketing image for ${campaignData.brand_name} campaign "${campaignData.title}". 
                     Campaign description: ${campaignData.description || 'Premium brand experience'}.
                     Style: ${tone === 'professional' ? 'clean corporate business style' : 
                              tone === 'casual' ? 'friendly approachable lifestyle style' :
                              tone === 'enthusiastic' ? 'energetic vibrant dynamic style' :
                              tone === 'humorous' ? 'playful entertaining fun style' :
                              'modern professional style'}. 
                     Target audience: ${campaignData.target_audience || 'general audience'}.
                     ${platform === 'instagram' ? 'Square format, social media optimized' : 
                       'Horizontal format, social media ready'}. 
                     High quality, modern, photorealistic, brand-focused imagery.
                     Keywords: ${aiSettings?.keywords || 'quality, innovation'}.`;

  try {
    const imageResponse = await generateRunwayMLImage(imagePrompt);

    if (imageResponse && imageResponse.ok) {
      const imageData = await imageResponse.json();
      if (imageData.data && imageData.data[0] && imageData.data[0].url) {
        return {
          content: `${tone} professional image for ${campaignData.brand_name} "${campaignData.title}" campaign - ${campaignData.description}`,
          mediaUrl: imageData.data[0].url
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
    // Use campaign-related stock images as fallback
    const campaignImages = [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adcf?w=800&h=600&fit=crop&q=80'
    ];
    
    const randomImage = campaignImages[Math.floor(Math.random() * campaignImages.length)];
    
    return {
      content: `${tone} image concept for ${campaignData.brand_name} "${campaignData.title}" - ${campaignData.description} - optimized for ${platform} ${contentType}`,
      mediaUrl: randomImage
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
  
  // Create video prompt for RunwayML (15 seconds max)
  const videoPrompt = `15-second professional marketing video for ${campaignData.brand_name} campaign "${campaignData.title}". 
                     Campaign focus: ${campaignData.description || 'Premium brand experience'}.
                     Style: ${tone === 'professional' ? 'corporate, clean, business-focused' : 
                              tone === 'casual' ? 'friendly, lifestyle, approachable' :
                              tone === 'enthusiastic' ? 'energetic, dynamic, exciting' :
                              tone === 'humorous' ? 'playful, entertaining, fun' :
                              'modern, engaging, professional'}.
                     Target: ${campaignData.target_audience || 'general audience'}.
                     Duration: exactly 15 seconds.
                     Quality: high-definition, brand-focused visuals.
                     Keywords: ${aiSettings?.keywords || 'quality, innovation'}.`;

  try {
    const videoResponse = await generateRunwayMLVideo(videoPrompt);

    if (videoResponse && videoResponse.ok) {
      const videoData = await videoResponse.json();
      if (videoData.data && videoData.data[0] && videoData.data[0].url) {
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

        return {
          content: scriptContent + `\n\n🎬 Video generated with RunwayML for ${platform} ${contentType}`,
          mediaUrl: videoData.data[0].url
        };
      } else {
        throw new Error('Invalid RunwayML video response structure');
      }
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
⏱️ DURATION: 15 seconds

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
      mediaUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4'
    };
  }
}
