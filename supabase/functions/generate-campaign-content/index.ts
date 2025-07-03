
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { CampaignData, GeneratedContent, AISettings } from './types.ts';
import { generateCopyContent, generateImageContent, generateVideoContent } from './content-generators.ts';
import { saveCampaignContent } from './database.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting campaign content generation request');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));

    // Handle both legacy format and new format
    let campaignData: CampaignData;
    let contentRequests: Array<{ platform: string; contentType: string; mediaType: string; }>;
    let aiSettings: AISettings;

    if (requestBody.campaignData && requestBody.aiSettings) {
      // Legacy format from CreateCampaign page
      campaignData = requestBody.campaignData;
      aiSettings = requestBody.aiSettings;
      
      // Convert AI settings to content requests
      contentRequests = [];
      const platforms = aiSettings.platform === 'all' 
        ? ['facebook', 'instagram', 'linkedin', 'twitter', 'email']
        : [aiSettings.platform || 'social'];
      const contentTypes = aiSettings.contentType === 'all' 
        ? ['copy', 'image', 'video', 'email'] 
        : [aiSettings.contentType];
      
      for (const platform of platforms) {
        for (const contentType of contentTypes) {
          // For email platform, only generate copy content (with visual placeholders)
          if (platform === 'email' && contentType !== 'copy' && contentType !== 'email') {
            continue;
          }
          let mediaType = contentType;
          if (contentType === 'copy') mediaType = 'text';
          contentRequests.push({
            platform,
            contentType,
            mediaType
          });
        }
      }
    } else {
      // New format
      campaignData = requestBody.campaignData;
      contentRequests = requestBody.contentRequests;
      aiSettings = requestBody.aiSettings;
    }

    if (!campaignData || !contentRequests) {
      throw new Error('Missing required campaign data or content requests');
    }

    console.log(`Processing ${contentRequests.length} content requests for campaign: ${campaignData.title}`);

    const generatedContent: GeneratedContent[] = [];

    for (const request of contentRequests) {
      try {
        console.log(`Generating ${request.mediaType} content for ${request.platform} - ${request.contentType}`);
        
        let content: { content: string; mediaUrl?: string } = { content: '' };

        switch (request.mediaType) {
          case 'text':
          case 'copy':
            content = { content: await generateCopyContent(request.platform, request.contentType, campaignData, aiSettings) };
            break;
          case 'image':
            content = await generateImageContent(request.platform, request.contentType, campaignData, aiSettings);
            break;
          case 'video':
            content = await generateVideoContent(request.platform, request.contentType, campaignData, aiSettings);
            break;
          default:
            console.warn(`Unknown media type: ${request.mediaType}, defaulting to text`);
            content = { content: await generateCopyContent(request.platform, request.contentType, campaignData, aiSettings) };
        }

        const generatedItem: GeneratedContent = {
          platform: request.platform,
          contentType: request.contentType,
          mediaType: request.mediaType,
          content: content.content,
          mediaUrl: content.mediaUrl || null,
          status: 'generated'
        };

        generatedContent.push(generatedItem);
        
        // Save to database only if we have a valid campaign ID
        if (campaignData.id) {
          await saveCampaignContent(supabase, campaignData.id, generatedItem);
        }
        
        console.log(`Successfully generated and saved ${request.mediaType} content for ${request.platform}`);
      } catch (error) {
        console.error(`Error generating content for ${request.platform} ${request.mediaType}:`, error);
        
        // Add error entry but continue with other requests
        const errorItem: GeneratedContent = {
          platform: request.platform,
          contentType: request.contentType,
          mediaType: request.mediaType,
          content: `Error generating content: ${error.message}`,
          mediaUrl: null,
          status: 'error'
        };
        generatedContent.push(errorItem);
      }
    }

    console.log(`Campaign content generation completed. Generated ${generatedContent.length} items.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        generatedContent,
        message: `Generated ${generatedContent.length} pieces of content` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Campaign content generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
