import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_API_KEY');

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

    // Generate content for each platform and content type
    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        for (const mediaType of mediaTypes) {
          let content = '';
          let mediaUrl = '';
          let prompt = '';

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

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: 'You are an expert marketing copywriter with 20+ years of experience. Create compelling, platform-specific content that drives engagement and conversions. Follow platform best practices and character limits.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500,
              }),
            });

            const data = await response.json();
            content = data.choices[0].message.content;
            
          } else if (mediaType === 'image') {
            const imagePrompt = `Professional ${contentType} image for ${platform} featuring ${campaignData.brand_name} ${campaignData.title}. 
                               Style: ${aiSettings?.tone === 'professional' ? 'clean, modern, corporate' : 
                                        aiSettings?.tone === 'casual' ? 'friendly, approachable, lifestyle' :
                                        'high-quality, engaging, premium'}. 
                               Platform: ${platform} (${platform === 'instagram' ? 'square format, vibrant' : 
                                                      platform === 'linkedin' ? 'professional, business-focused' :
                                                      'eye-catching, social media optimized'}).
                               Include brand elements, ${contentType === 'paid_ad' ? 'promotional elements, clear value proposition' : 'lifestyle elements, brand personality'}.
                               High quality, modern design, professional photography style.`;

            try {
              const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openAIApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'gpt-image-1',
                  prompt: imagePrompt,
                  size: platform === 'instagram' ? '1024x1024' : '1536x1024',
                  quality: 'high',
                  n: 1,
                }),
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                if (imageData.data && imageData.data[0]) {
                  content = `Generated professional image for ${platform} ${contentType}`;
                  mediaUrl = imageData.data[0].url || `data:image/png;base64,${imageData.data[0].b64_json}`;
                }
              } else {
                console.error('Image generation failed:', await imageResponse.text());
                content = `Professional image concept: ${imagePrompt}`;
              }
            } catch (imageError) {
              console.error('Image generation error:', imageError);
              content = `Professional image concept: ${imagePrompt}`;
            }
            
          } else if (mediaType === 'video') {
            const videoPrompt = `${campaignData.brand_name} ${campaignData.title} campaign video for ${platform}. ${aiSettings?.tone || 'Professional'} style showcasing ${campaignData.target_audience || 'target audience'}. ${contentType === 'paid_ad' ? 'Product focused with clear benefits and call-to-action' : 'Brand storytelling and engagement focused'}. High quality, modern, ${platform === 'instagram' ? 'vertical format' : 'landscape format'}.`;

            try {
              if (huggingFaceApiKey) {
                // Use Hugging Face for actual video generation
                console.log('Generating video with Hugging Face:', videoPrompt);
                
                const hfResponse = await fetch('https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${huggingFaceApiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    inputs: videoPrompt,
                    parameters: {
                      num_frames: platform === 'instagram' ? 16 : 24,
                      num_inference_steps: 25
                    }
                  }),
                });

                if (hfResponse.ok) {
                  const videoBlob = await hfResponse.blob();
                  if (videoBlob.size > 0) {
                    // Convert blob to base64 for storage
                    const arrayBuffer = await videoBlob.arrayBuffer();
                    const base64Video = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                    mediaUrl = `data:video/mp4;base64,${base64Video}`;
                    content = `AI-generated video for ${platform} ${contentType} - ${campaignData.brand_name} ${campaignData.title}`;
                  } else {
                    throw new Error('Empty video response');
                  }
                } else {
                  const errorText = await hfResponse.text();
                  console.error('Hugging Face video generation failed:', errorText);
                  throw new Error(`HF API error: ${errorText}`);
                }
              } else {
                throw new Error('Hugging Face API key not configured');
              }
            } catch (videoError) {
              console.error('Video generation error:', videoError);
              
              // Fallback to detailed video script generation
              const scriptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openAIApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    { role: 'system', content: 'You are a professional video content creator and scriptwriter. Create detailed, actionable video concepts with scene-by-scene breakdowns that can be easily produced.' },
                    { role: 'user', content: `Create a detailed video script and production guide for ${contentType} on ${platform} for ${campaignData.brand_name} ${campaignData.title}.
                                           Target: ${campaignData.target_audience || 'general audience'}.
                                           Tone: ${aiSettings?.tone || 'professional'}.
                                           Duration: ${platform === 'instagram' ? '15-30 seconds for Reel' : 
                                                      platform === 'twitter' ? '30-60 seconds' : 
                                                      '60-90 seconds'}.
                                           Include: Scene descriptions, voiceover script, visual elements, music suggestions, call-to-action.
                                           ${contentType === 'paid_ad' ? 'Include clear product shots, benefits, and strong CTA' : 'Focus on storytelling, brand personality, and engagement'}.
                                           Note: Video generation temporarily unavailable - providing detailed production script instead.` }
                  ],
                  temperature: 0.7,
                  max_tokens: 800,
                }),
              });

              const scriptData = await scriptResponse.json();
              content = `[Video Script - Ready for Production]\n\n${scriptData.choices[0].message.content}\n\n⚠️ Note: Actual video generation will be available once Hugging Face API is configured.`;
            }
          }

          // Store generated content in database
          const { error } = await supabaseClient
            .from('campaign_generated_content')
            .insert({
              campaign_id: campaignId,
              platform,
              content_type: contentType,
              media_type: mediaType,
              content_text: content,
              media_url: mediaUrl || null,
              generated_prompt: prompt || videoPrompt,
              status: 'generated'
            });

          if (error) {
            console.error('Error saving content:', error);
          } else {
            generatedContent.push({
              platform,
              content_type: contentType,
              media_type: mediaType,
              content: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
              has_media: !!mediaUrl
            });
          }
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
