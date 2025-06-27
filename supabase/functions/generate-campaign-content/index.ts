
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { campaignId, campaignData } = await req.json();

    const platforms = ['facebook', 'instagram', 'linkedin', 'twitter', 'mailchimp', 'klaviyo'];
    const contentTypes = ['organic_post', 'paid_ad', 'email'];
    const mediaTypes = ['copy', 'image', 'video'];

    const generatedContent = [];

    // Generate content for each platform and content type
    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        // Skip email for social platforms and social posts for email platforms
        if ((platform === 'mailchimp' || platform === 'klaviyo') && contentType !== 'email') continue;
        if ((platform !== 'mailchimp' && platform !== 'klaviyo') && contentType === 'email') continue;

        for (const mediaType of mediaTypes) {
          let content = '';
          let prompt = '';

          if (mediaType === 'copy') {
            prompt = `Create ${contentType} copy for ${platform} for the campaign "${campaignData.title}" by ${campaignData.brand_name}. 
                     Target audience: ${campaignData.target_audience || 'general audience'}. 
                     Campaign goals: ${campaignData.campaign_goals?.join(', ') || 'brand awareness'}.
                     Make it ${platform === 'linkedin' ? 'professional' : platform === 'twitter' ? 'concise and engaging' : 'engaging and visual'}.
                     ${contentType === 'paid_ad' ? 'Include a clear call-to-action.' : ''}
                     ${contentType === 'email' ? 'Include subject line and body with personalization.' : ''}`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: 'You are an expert marketing copywriter. Create compelling content that drives engagement and conversions.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500,
              }),
            });

            const data = await response.json();
            content = data.choices[0].message.content;
          } else if (mediaType === 'image') {
            prompt = `High-quality ${contentType} image for ${platform} featuring ${campaignData.brand_name}. 
                     Style: ${platform === 'linkedin' ? 'professional and clean' : 'vibrant and eye-catching'}. 
                     Include brand elements and ${contentType === 'paid_ad' ? 'promotional elements' : 'lifestyle elements'}.`;

            const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-image-1',
                prompt: prompt,
                size: platform === 'instagram' ? '1024x1024' : '1536x1024',
                quality: 'high',
                n: 1,
              }),
            });

            const imageData = await imageResponse.json();
            content = `Generated image concept: ${prompt}`;
            // In a real implementation, you would save the image and store the URL
          } else if (mediaType === 'video') {
            content = `Video concept for ${contentType} on ${platform}: 
                      ${platform === 'instagram' ? '15-30 second Reel' : platform === 'twitter' ? 'Short video clip' : '60-90 second video'} 
                      showcasing ${campaignData.brand_name} ${campaignData.title}. 
                      ${contentType === 'paid_ad' ? 'Include clear product shots and CTA' : 'Focus on storytelling and brand personality'}.
                      Target: ${campaignData.target_audience || 'general audience'}.`;
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
              generated_prompt: prompt,
              status: 'generated'
            });

          if (error) {
            console.error('Error saving content:', error);
          } else {
            generatedContent.push({
              platform,
              content_type: contentType,
              media_type: mediaType,
              content: content.substring(0, 100) + '...'
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
