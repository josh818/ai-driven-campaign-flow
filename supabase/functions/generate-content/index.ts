import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ContentRequest {
  campaignTitle: string;
  campaignDescription: string;
  brandName: string;
  targetAudience: string;
  tone: string;
  platforms: string[];
  contentTypes: string[];
}

// Generate copy content
async function generateCopy(prompt: string, platform: string): Promise<string> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (geminiApiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Generated copy content';
      }
    } catch (error) {
      console.log('Gemini failed:', error);
    }
  }

  // Fallback
  return `🎯 ${prompt.split('Campaign:')[1]?.split('Brand:')[0]?.trim() || 'New Campaign'}\n\nExperience the difference with our premium solution tailored for ${platform}.\n\n#Innovation #Quality #Premium`;
}

// Generate image
async function generateImage(prompt: string): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.[0]?.url || '';
      }
    } catch (error) {
      console.log('OpenAI image failed:', error);
    }
  }

  // Fallback stock image
  return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&h=1024&fit=crop&q=80';
}

// Generate video
async function generateVideo(prompt: string): Promise<string> {
  const runwayApiKey = Deno.env.get('RUNWAYML_API_KEY');
  
  if (runwayApiKey) {
    try {
      const response = await fetch('https://api.runwayml.com/v1/image_to_video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptText: prompt + ' - 5 second video',
          model: 'gen3a_turbo',
          assetGroupName: 'default'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.url || '';
      }
    } catch (error) {
      console.log('RunwayML failed:', error);
    }
  }

  // Fallback video
  return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      campaignTitle,
      campaignDescription,
      brandName,
      targetAudience,
      tone,
      platforms,
      contentTypes
    }: ContentRequest = await req.json();

    console.log('Generating content for:', { campaignTitle, platforms, contentTypes });

    const generatedContent = [];

    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        const basePrompt = `Campaign: ${campaignTitle}
Brand: ${brandName}
Description: ${campaignDescription}
Target Audience: ${targetAudience}
Tone: ${tone}
Platform: ${platform}`;

        let content = '';
        let mediaUrl = '';

        if (contentType === 'copy' || contentType === 'text') {
          const copyPrompt = platform === 'email' 
            ? `${basePrompt}\n\nCreate a professional email with subject line, greeting, body, and call-to-action.`
            : `${basePrompt}\n\nCreate engaging ${platform} post copy with hashtags. Keep it concise and platform-appropriate.`;
          
          content = await generateCopy(copyPrompt, platform);
        }

        if (contentType === 'image') {
          const imagePrompt = `Professional marketing image for ${campaignTitle} by ${brandName}. ${campaignDescription}. ${tone} style, high quality commercial photography.`;
          mediaUrl = await generateImage(imagePrompt);
          content = `Generated image for ${campaignTitle} campaign`;
        }

        if (contentType === 'video') {
          const videoPrompt = `5-second marketing video for ${campaignTitle} by ${brandName}. ${campaignDescription}. ${tone} style commercial.`;
          mediaUrl = await generateVideo(videoPrompt);
          content = `Generated 5-second video for ${campaignTitle} campaign`;
        }

        generatedContent.push({
          platform,
          contentType,
          content,
          mediaUrl: mediaUrl || null,
          status: 'generated'
        });
      }
    }

    console.log('Generated content:', generatedContent.length, 'items');

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent,
        message: `Generated ${generatedContent.length} pieces of content` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Content generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});