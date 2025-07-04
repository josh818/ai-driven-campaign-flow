import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface FileUploadResult {
  filePath: string;
  publicUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface AIGeneratedFile {
  campaignId: string;
  contentId?: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  originalUrl?: string;
  aiService: string;
  aiModel: string;
  generationPrompt?: string;
}

/**
 * Upload base64 data to Supabase storage
 */
export async function uploadBase64ToStorage(
  base64Data: string,
  campaignId: string,
  contentType: 'image' | 'video',
  aiService: string,
  aiModel: string,
  generationPrompt?: string
): Promise<FileUploadResult> {
  try {
    // Extract the actual base64 data (remove data:image/png;base64, prefix)
    const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid base64 data format');
    }

    const [, mimeType, base64Content] = base64Match;
    const fileExtension = mimeType.split('/')[1] || 'bin';
    
    // Generate unique file path
    const fileName = `${contentType}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `campaigns/${campaignId}/${contentType}/${fileName}`;
    
    // Convert base64 to Uint8Array
    const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('ai-generated-content')
      .upload(filePath, binaryData, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('ai-generated-content')
      .getPublicUrl(filePath);

    // Save file metadata to database
    const fileRecord: AIGeneratedFile = {
      campaignId,
      filePath,
      fileName,
      fileSize: binaryData.length,
      mimeType,
      originalUrl: base64Data.substring(0, 100) + '...', // Store truncated version for reference
      aiService,
      aiModel,
      generationPrompt
    };

    await saveFileMetadata(fileRecord);

    return {
      filePath,
      publicUrl: urlData.publicUrl,
      fileSize: binaryData.length,
      mimeType
    };
  } catch (error) {
    console.error('Error uploading to storage:', error);
    throw error;
  }
}

/**
 * Upload URL-based content to Supabase storage
 */
export async function uploadUrlToStorage(
  url: string,
  campaignId: string,
  contentType: 'image' | 'video',
  aiService: string,
  aiModel: string,
  generationPrompt?: string
): Promise<FileUploadResult> {
  try {
    // Fetch the file from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URL: ${response.status}`);
    }

    const contentTypeHeader = response.headers.get('content-type');
    const mimeType = contentTypeHeader || (contentType === 'image' ? 'image/png' : 'video/mp4');
    const fileExtension = mimeType.split('/')[1] || 'bin';
    
    // Generate unique file path
    const fileName = `${contentType}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `campaigns/${campaignId}/${contentType}/${fileName}`;
    
    // Get the file as array buffer
    const arrayBuffer = await response.arrayBuffer();
    const binaryData = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('ai-generated-content')
      .upload(filePath, binaryData, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('ai-generated-content')
      .getPublicUrl(filePath);

    // Save file metadata to database
    const fileRecord: AIGeneratedFile = {
      campaignId,
      filePath,
      fileName,
      fileSize: binaryData.length,
      mimeType,
      originalUrl: url,
      aiService,
      aiModel,
      generationPrompt
    };

    await saveFileMetadata(fileRecord);

    return {
      filePath,
      publicUrl: urlData.publicUrl,
      fileSize: binaryData.length,
      mimeType
    };
  } catch (error) {
    console.error('Error uploading URL to storage:', error);
    throw error;
  }
}

/**
 * Save file metadata to the database
 */
async function saveFileMetadata(fileRecord: AIGeneratedFile): Promise<void> {
  const { error } = await supabase
    .from('ai_generated_files')
    .insert({
      campaign_id: fileRecord.campaignId,
      content_id: fileRecord.contentId,
      file_path: fileRecord.filePath,
      file_name: fileRecord.fileName,
      file_size: fileRecord.fileSize,
      mime_type: fileRecord.mimeType,
      original_url: fileRecord.originalUrl,
      ai_service: fileRecord.aiService,
      ai_model: fileRecord.aiModel,
      generation_prompt: fileRecord.generationPrompt
    });

  if (error) {
    console.error('Error saving file metadata:', error);
    throw error;
  }
}

/**
 * Update campaign_content table with file information
 */
export async function updateContentWithFileInfo(
  contentId: string,
  filePath: string,
  fileSize: number,
  mimeType: string
): Promise<void> {
  const { error } = await supabase
    .from('campaign_content')
    .update({
      file_path: filePath,
      file_size: fileSize,
      mime_type: mimeType,
      storage_bucket: 'ai-generated-content'
    })
    .eq('id', contentId);

  if (error) {
    console.error('Error updating content with file info:', error);
    throw error;
  }
}

/**
 * Get public URL for a stored file
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('ai-generated-content')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Delete a file from storage and database
 */
export async function deleteFile(filePath: string, contentId?: string): Promise<void> {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('ai-generated-content')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }

    // Delete from database if contentId is provided
    if (contentId) {
      const { error: dbError } = await supabase
        .from('ai_generated_files')
        .delete()
        .eq('content_id', contentId);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
      }
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
} 