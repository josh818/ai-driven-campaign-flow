
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CampaignData, AISettings, GeneratedContent } from './types.ts';
import { generateCopyContent, generateImageContent, generateVideoContent } from './content-generators.ts';
import { saveGeneratedContent } from './database.ts';

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

    const { campaignId, campaignData, aiSettings }: {
      campaignId: string | null;
      campaignData: CampaignData;
      aiSettings: AISettings;
    } = await req.json();

    const platforms = aiSettings?.platform ? [aiSettings.platform] : ['facebook', 'instagram', 'linkedin', 'twitter'];
    const contentTypes = ['organic_post', 'paid_ad'];
    const mediaTypes = aiSettings?.contentType === 'all' ? ['copy', 'image', 'video'] : 
                      aiSettings?.contentType ? [aiSettings.contentType] : ['copy', 'image'];

    const generatedContent: GeneratedContent[] = [];

    // Process requests in smaller batches to avoid rate limits
    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        for (const mediaType of mediaTypes) {
          let content = '';
          let mediaUrl = '';
          let prompt = '';

          console.log(`Generating ${mediaType} for ${platform} ${contentType}`);

          if (mediaType === 'copy') {
            content = await generateCopyContent(platform, contentType, campaignData, aiSettings);
            prompt = `Copy for ${platform} ${contentType}`;
          } else if (mediaType === 'image') {
            const result = await generateImageContent(platform, contentType, campaignData, aiSettings);
            content = result.content;
            mediaUrl = result.mediaUrl;
            prompt = `Image for ${platform} ${contentType}`;
          } else if (mediaType === 'video') {
            const result = await generateVideoContent(platform, contentType, campaignData, aiSettings);
            content = result.content;
            mediaUrl = result.mediaUrl;
            prompt = `Video script for ${platform} ${contentType}`;
          }

          // Store generated content in database
          await saveGeneratedContent(
            campaignId,
            platform,
            contentType,
            mediaType,
            content,
            mediaUrl || null,
            prompt
          );

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
