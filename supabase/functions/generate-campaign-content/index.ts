
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

    // Handle email as both content type and platform
    const platforms = aiSettings?.platform ? [aiSettings.platform] : 
                     aiSettings?.contentType === 'email' ? ['email'] :
                     ['facebook', 'instagram', 'linkedin', 'twitter'];
    
    const contentTypes = ['organic_post', 'paid_ad'];
    
    const generatedContent: GeneratedContent[] = [];

    console.log(`Starting content generation for platforms: ${platforms.join(', ')}`);

    // Process requests with longer delays to avoid rate limits
    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        // For social media platforms, generate copy, image, and video
        if (platform !== 'email') {
          // Generate copy first
          if (aiSettings?.contentType === 'all' || aiSettings?.contentType === 'copy' || !aiSettings?.contentType) {
            console.log(`Generating copy for ${platform} ${contentType}`);
            try {
              const copyContent = await generateCopyContent(platform, contentType, campaignData, aiSettings);
              
              await saveGeneratedContent(
                campaignId,
                platform,
                contentType,
                'copy',
                copyContent,
                null,
                `Copy for ${platform} ${contentType}`
              );

              generatedContent.push({
                platform,
                content_type: contentType,
                media_type: 'copy',
                content: copyContent.substring(0, 150) + (copyContent.length > 150 ? '...' : ''),
                has_media: false,
                media_url: undefined
              });

              // Delay between requests
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
              console.error(`Error generating copy for ${platform} ${contentType}:`, error);
            }
          }

          // Generate image
          if (aiSettings?.contentType === 'all' || aiSettings?.contentType === 'image' || !aiSettings?.contentType) {
            console.log(`Generating image for ${platform} ${contentType}`);
            try {
              const imageResult = await generateImageContent(platform, contentType, campaignData, aiSettings);
              
              await saveGeneratedContent(
                campaignId,
                platform,
                contentType,
                'image',
                imageResult.content,
                imageResult.mediaUrl,
                `Image for ${platform} ${contentType}`
              );

              generatedContent.push({
                platform,
                content_type: contentType,
                media_type: 'image',
                content: imageResult.content.substring(0, 150) + (imageResult.content.length > 150 ? '...' : ''),
                has_media: true,
                media_url: imageResult.mediaUrl
              });

              // Delay between requests
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
              console.error(`Error generating image for ${platform} ${contentType}:`, error);
            }
          }

          // Generate video
          if (aiSettings?.contentType === 'all' || aiSettings?.contentType === 'video') {
            console.log(`Generating video for ${platform} ${contentType}`);
            try {
              const videoResult = await generateVideoContent(platform, contentType, campaignData, aiSettings);
              
              await saveGeneratedContent(
                campaignId,
                platform,
                contentType,
                'video',
                videoResult.content,
                videoResult.mediaUrl,
                `Video script for ${platform} ${contentType}`
              );

              generatedContent.push({
                platform,
                content_type: contentType,
                media_type: 'video',
                content: videoResult.content.substring(0, 150) + (videoResult.content.length > 150 ? '...' : ''),
                has_media: true,
                media_url: videoResult.mediaUrl
              });

              // Delay between requests
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
              console.error(`Error generating video for ${platform} ${contentType}:`, error);
            }
          }
        } else {
          // For email platform, generate email content with image
          if (aiSettings?.contentType === 'email' || aiSettings?.contentType === 'all') {
            console.log(`Generating email content`);
            try {
              // Generate email copy
              const emailContent = await generateCopyContent('email', contentType, campaignData, aiSettings);
              
              // Generate email image
              const emailImageResult = await generateImageContent('email', contentType, campaignData, aiSettings);
              
              await saveGeneratedContent(
                campaignId,
                'email',
                contentType,
                'email',
                emailContent,
                emailImageResult.mediaUrl,
                `Email with image for ${contentType}`
              );

              generatedContent.push({
                platform: 'email',
                content_type: contentType,
                media_type: 'email',
                content: emailContent.substring(0, 150) + (emailContent.length > 150 ? '...' : ''),
                has_media: true,
                media_url: emailImageResult.mediaUrl
              });

              // Delay between requests
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
              console.error(`Error generating email content:`, error);
            }
          }
        }
      }
    }

    console.log(`Generated ${generatedContent.length} content pieces`);

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
