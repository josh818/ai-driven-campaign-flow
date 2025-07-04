-- Add file storage fields to campaign_content table
ALTER TABLE public.campaign_content 
ADD COLUMN file_path TEXT,
ADD COLUMN file_size INTEGER,
ADD COLUMN mime_type TEXT,
ADD COLUMN storage_bucket TEXT DEFAULT 'ai-generated-content';

-- Create a table to track file uploads and their metadata
CREATE TABLE public.ai_generated_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.campaign_content(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'ai-generated-content',
  original_url TEXT, -- Store the original AI service URL for reference
  ai_service TEXT NOT NULL, -- 'gemini', 'openai', 'runwayml'
  ai_model TEXT NOT NULL, -- Specific model used
  generation_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploading', 'uploaded', 'failed', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_generated_files ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_generated_files
CREATE POLICY "Users can view their AI generated files" 
  ON public.ai_generated_files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = ai_generated_files.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their AI generated files" 
  ON public.ai_generated_files 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = ai_generated_files.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Create function to get public URL for files
CREATE OR REPLACE FUNCTION public.get_file_url(file_path TEXT, bucket_name TEXT DEFAULT 'ai-generated-content')
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT storage.url(bucket_name, file_path);
$$;

-- Create function to handle file cleanup when content is deleted
CREATE OR REPLACE FUNCTION public.handle_content_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete associated files from storage
  DELETE FROM storage.objects 
  WHERE bucket_id = OLD.storage_bucket 
  AND name = OLD.file_path;
  
  -- Delete file records
  DELETE FROM public.ai_generated_files 
  WHERE content_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger for content deletion
CREATE TRIGGER on_campaign_content_deleted
  AFTER DELETE ON public.campaign_content
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_content_deletion();

-- Create function to generate unique file paths
CREATE OR REPLACE FUNCTION public.generate_file_path(
  campaign_id UUID,
  content_type TEXT,
  file_extension TEXT
)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT 'campaigns/' || campaign_id::TEXT || '/' || 
         content_type || '/' || 
         gen_random_uuid()::TEXT || '.' || file_extension;
$$; 