
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function saveGeneratedContent(
  campaignId: string | null,
  platform: string,
  contentType: string,
  mediaType: string,
  content: string,
  mediaUrl: string | null,
  prompt: string
) {
  if (!campaignId) return;

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { error } = await supabaseClient
    .from('campaign_generated_content')
    .insert({
      campaign_id: campaignId,
      platform,
      content_type: contentType,
      media_type: mediaType,
      content_text: content,
      media_url: mediaUrl || null,
      generated_prompt: prompt,
      status: 'generated'
    });

  if (error) {
    console.error('Error saving content:', error);
  }
}
