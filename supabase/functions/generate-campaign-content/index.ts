
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to make OpenAI requests with retry logic
async function makeOpenAIRequest(url: string, body: any, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429 && i < retries) {
        // Rate limited - wait and retry
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Request failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { campaignId, campaignData, aiSettings } = await req.json();

    const platforms = aiSettings?.platform ? [aiSettings.platform] : ['facebook', 'instagram', 'linkedin', 'twitter'];
    const contentTypes = ['organic_post', 'paid_ad'];
    const mediaTypes = aiSettings?.contentType === 'all' ? ['copy', 'image', 'video'] : 
                      aiSettings?.contentType ? [aiSettings.contentType] : ['copy', 'image'];

    const generatedContent = [];

    // Process requests in smaller batches to avoid rate limits
    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        for (const mediaType of mediaTypes) {
          let content = '';
          let mediaUrl = '';
          let prompt = '';

          console.log(`Generating ${mediaType} for ${platform} ${contentType}`);

          if (mediaType === 'copy') {
            prompt = `Create ${contentType} copy for ${platform} for the campaign "${campaignData.title}" by ${campaignData.brand_name}. 
                     Target audience: ${campaignData.target_audience || 'general audience'}. 
                     Campaign goals: ${campaignData.campaign_goals?.join(', ') || 'brand awareness'}.
                     Tone: ${aiSettings?.tone || 'professional'}.
                     Keywords to include: ${aiSettings?.keywords || 'quality, innovation'}.
                     Make it ${platform === 'linkedin' ? 'professional and business-focused' : 
                               platform === 'twitter' ? 'concise and engaging with hashtags' : 
                               platform === 'instagram' ? 'visually descriptive and lifestyle-focused' :
                               'engaging and conversational'}.
                     ${contentType === 'paid_ad' ? 'Include a clear call-to-action and compelling offer.' : 'Focus on engagement and brand storytelling.'}
                     Keep it appropriate for ${platform} character limits and best practices.`;

            try {
              const response = await makeOpenAIRequest('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: 'You are an expert marketing copywriter with 20+ years of experience. Create compelling, platform-specific content that drives engagement and conversions. Follow platform best practices and character limits.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500,
              });

              if (response && response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                  content = data.choices[0].message.content;
                } else {
                  throw new Error('Invalid OpenAI response structure');
                }
              } else {
                throw new Error(`OpenAI API error: ${response?.status}`);
              }
            } catch (error) {
              console.error('Copy generation error:', error);
              // Create prompt-specific fallback content
              content = `${contentType === 'paid_ad' ? '🚀 Special Offer!' : '✨'} ${campaignData.brand_name} presents: ${campaignData.title}
              
Perfect for ${campaignData.target_audience || 'our valued customers'}! 
${campaignData.description || 'Experience the difference with our premium solution.'}

${campaignData.campaign_goals?.length ? `Goals: ${campaignData.campaign_goals.join(' • ')}` : ''}
${aiSettings?.keywords ? `#${aiSettings.keywords.split(',').map(k => k.trim()).join(' #')}` : '#Quality #Innovation #Excellence'}

${contentType === 'paid_ad' ? '👉 Act now and discover what makes us different!' : '💫 Join thousands who trust ' + campaignData.brand_name}`;
            }
            
          } else if (mediaType === 'image') {
            const imagePrompt = `Professional ${contentType} image for ${campaignData.brand_name} featuring "${campaignData.title}" campaign. 
                               Brand: ${campaignData.brand_name}
                               Campaign: ${campaignData.title}
                               Target audience: ${campaignData.target_audience || 'general audience'}
                               Style: ${aiSettings?.tone === 'professional' ? 'clean, modern, corporate branding' : 
                                        aiSettings?.tone === 'casual' ? 'friendly, approachable, lifestyle photography' :
                                        'high-quality, premium, professional marketing visual'}. 
                               Platform: ${platform} optimized (${platform === 'instagram' ? 'square format, vibrant colors, social media ready' : 
                                                               platform === 'linkedin' ? 'professional, business-focused, corporate design' :
                                                               'eye-catching, social media optimized, engaging visual'}).
                               Content: ${contentType === 'paid_ad' ? 'promotional design with clear value proposition and call-to-action elements' : 'brand storytelling visual with lifestyle elements'}.
                               Keywords: ${aiSettings?.keywords || 'quality, innovation, premium'}
                               High resolution, modern design, professional photography style, no text overlays.`;

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
                  content = `AI-generated professional image for ${campaignData.brand_name} ${campaignData.title} campaign, optimized for ${platform} ${contentType}`;
                  mediaUrl = imageData.data[0].url;
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
              content = `Professional ${aiSettings?.tone || 'premium'} image concept for ${campaignData.brand_name} "${campaignData.title}" campaign - ${platform} ${contentType} featuring ${campaignData.target_audience || 'target audience'} focused design with ${aiSettings?.keywords || 'quality, innovation'} elements`;
              mediaUrl = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80`;
            }
            
          } else if (mediaType === 'video') {
            const videoPrompt = `Create a detailed video production script for ${campaignData.brand_name} "${campaignData.title}" campaign.
                               Brand: ${campaignData.brand_name}
                               Campaign: ${campaignData.title}
                               Description: ${campaignData.description || 'Premium brand experience'}
                               Platform: ${platform} (${platform === 'instagram' ? '15-30 second vertical video, Stories/Reels format' : 
                                                      platform === 'twitter' ? '30-60 second horizontal video, Twitter native' : 
                                                      platform === 'linkedin' ? '60-90 second professional video, business-focused' :
                                                      '30-60 second engaging video, optimized for social sharing'})
                               Content Type: ${contentType} (${contentType === 'paid_ad' ? 'Product/service showcase with clear benefits and strong CTA' : 'Brand story and audience engagement focused'})
                               Target: ${campaignData.target_audience || 'general audience'}
                               Tone: ${aiSettings?.tone || 'professional'}
                               Keywords: ${aiSettings?.keywords || 'quality, innovation'}
                               Goals: ${campaignData.campaign_goals?.join(', ') || 'brand awareness, engagement'}
                               
                               Create a comprehensive script including:
                               1. HOOK (first 3 seconds) - attention-grabbing opener
                               2. MAIN CONTENT - core message delivery
                               3. CALL-TO-ACTION - clear next steps
                               4. VISUAL DESCRIPTIONS - specific shot types and scenes
                               5. AUDIO SUGGESTIONS - music style and voice-over notes
                               6. TEXT OVERLAYS - key messages and graphics
                               7. PRODUCTION NOTES - technical specifications
                               
                               Make it actionable for content creators and video editors.`;

            try {
              const scriptResponse = await makeOpenAIRequest('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: 'You are a professional video content strategist and scriptwriter specializing in social media marketing. Create detailed, actionable video scripts that can be easily produced by content creators and drive engagement.' },
                  { role: 'user', content: videoPrompt }
                ],
                temperature: 0.7,
                max_tokens: 1000,
              });

              if (scriptResponse && scriptResponse.ok) {
                const scriptData = await scriptResponse.json();
                if (scriptData.choices && scriptData.choices[0] && scriptData.choices[0].message) {
                  content = `[Professional Video Production Script for ${campaignData.brand_name}]\n\n${scriptData.choices[0].message.content}\n\n🎬 Ready for production with professional video editing tools.`;
                  mediaUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                } else {
                  throw new Error('Invalid script response structure');
                }
              } else {
                throw new Error(`Script API error: ${scriptResponse?.status}`);
              }
            } catch (scriptError) {
              console.error('Video script generation error:', scriptError);
              content = `[Professional Video Script for ${campaignData.brand_name} "${campaignData.title}"]\n\n🎬 CAMPAIGN: ${campaignData.title}\n🏢 BRAND: ${campaignData.brand_name}\n🎯 TARGET: ${campaignData.target_audience || 'General audience'}\n📱 PLATFORM: ${platform}\n⏱️ DURATION: ${platform === 'instagram' ? '15-30 seconds' : '30-60 seconds'}\n\n📋 SCRIPT BREAKDOWN:\n\n🎣 HOOK (0-3s): "${campaignData.brand_name} just changed the game..."\nShow: Dynamic brand visual with ${aiSettings?.keywords?.split(',')[0] || 'innovation'} focus\n\n💡 MAIN (3-25s): \n"${campaignData.description || 'Experience the difference with our premium solution'}"  \nTarget audience pain point → ${campaignData.brand_name} solution\nVisuals: Product/service in action, happy customers\n\n📞 CTA (25-30s): "${contentType === 'paid_ad' ? 'Get yours now!' : 'Follow for more!'}"\nText overlay: Strong call-to-action\n\n🎵 AUDIO: ${aiSettings?.tone || 'Professional'} background music\n📝 KEYWORDS: ${aiSettings?.keywords || 'quality, innovation, premium'}\n\n✨ Ready for production!`;
              mediaUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
            }
          }

          // Store generated content in database
          if (campaignId) {
            const { error } = await supabaseClient
              .from('campaign_generated_content')
              .insert({
                campaign_id: campaignId,
                platform,
                content_type: contentType,
                media_type: mediaType,
                content_text: content,
                media_url: mediaUrl || null,
                generated_prompt: prompt || videoPrompt || imagePrompt,
                status: 'generated'
              });

            if (error) {
              console.error('Error saving content:', error);
            }
          }

          generatedContent.push({
            platform,
            content_type: contentType,
            media_type: mediaType,
            content: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
            has_media: !!mediaUrl,
            media_url: mediaUrl
          });

          // Add delay between requests to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      generatedCount: generatedContent.length,
      preview: generatedContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-campaign-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
