import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { updateContentWithFileInfo } from './storage-utils.ts';

export async function saveCampaignContent(
  supabaseClient: any,
  campaignId: string,
  content: any
) {
  try {
    // First, save the content record
    const { data: contentData, error: contentError } = await supabaseClient
      .from('campaign_content')
      .insert({
        campaign_id: campaignId,
        content_type: content.contentType,
        content_text: content.content,
        media_url: content.mediaUrl || null,
        platform: content.platform,
        status: content.status || 'draft'
      })
      .select()
      .single();

    if (contentError) {
      console.error('Error saving content:', contentError);
      throw contentError;
    }

    // If we have file information, update the content record
    if (content.filePath && content.fileSize && content.mimeType) {
      await updateContentWithFileInfo(
        contentData.id,
        content.filePath,
        content.fileSize,
        content.mimeType
      );
    }

    console.log(`Saved content with ID: ${contentData.id}`);
    return contentData;
  } catch (error) {
    console.error('Error in saveCampaignContent:', error);
    throw error;
  }
}

export async function saveGeneratedContent(
  campaignId: string | null,
  platform: string,
  contentType: string,
  mediaType: string,
  content: string,
  mediaUrl: string | null,
  prompt: string,
  fileInfo?: {
    filePath: string;
    fileSize: number;
    mimeType: string;
  }
) {
  if (!campaignId) return;

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Save the content record
    const { data: contentData, error: contentError } = await supabaseClient
      .from('campaign_content')
      .insert({
        campaign_id: campaignId,
        content_type: contentType,
        content_text: content,
        media_url: mediaUrl || null,
        platform,
        status: 'draft'
      })
      .select()
      .single();

    if (contentError) {
      console.error('Error saving content:', contentError);
      throw contentError;
    }

    // If we have file information, update the content record
    if (fileInfo) {
      await updateContentWithFileInfo(
        contentData.id,
        fileInfo.filePath,
        fileInfo.fileSize,
        fileInfo.mimeType
      );
    }

    console.log(`Saved generated content with ID: ${contentData.id}`);
    return contentData;
  } catch (error) {
    console.error('Error in saveGeneratedContent:', error);
    throw error;
  }
}
