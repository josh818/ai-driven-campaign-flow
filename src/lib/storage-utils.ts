import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FileInfo {
  filePath: string;
  publicUrl: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Get the public URL for a file stored in Supabase storage
 */
export function getFileUrl(filePath: string, bucketName: string = 'ai-generated-content'): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Download a file from storage
 */
export async function downloadFile(filePath: string, fileName?: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from('ai-generated-content')
      .download(filePath);

    if (error) {
      throw error;
    }

    // Create a download link
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || filePath.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('ai-generated-content')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Upload a file to storage
 */
export async function uploadFile(
  file: File,
  campaignId: string,
  contentType: 'image' | 'video' | 'document'
): Promise<FileInfo> {
  try {
    const fileName = `${contentType}_${Date.now()}_${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    const filePath = `campaigns/${campaignId}/${contentType}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('ai-generated-content')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('ai-generated-content')
      .getPublicUrl(filePath);

    return {
      filePath,
      publicUrl: urlData.publicUrl,
      fileSize: file.size,
      mimeType: file.type
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Get file metadata from the database
 */
export async function getFileMetadata(contentId: string) {
  try {
    const { data, error } = await supabase
      .from('ai_generated_files')
      .select('*')
      .eq('content_id', contentId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

/**
 * Update content with file information
 */
export async function updateContentWithFileInfo(
  contentId: string,
  filePath: string,
  fileSize: number,
  mimeType: string
): Promise<void> {
  try {
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
      throw error;
    }
  } catch (error) {
    console.error('Error updating content with file info:', error);
    throw error;
  }
} 