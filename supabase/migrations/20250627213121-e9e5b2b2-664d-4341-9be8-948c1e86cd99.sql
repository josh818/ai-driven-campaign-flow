
-- Create a table to store social media connections
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  platform TEXT NOT NULL,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  access_token TEXT,
  refresh_token TEXT,
  account_name TEXT,
  account_id TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Add Row Level Security
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for social connections
CREATE POLICY "Users can view their own social connections" 
  ON public.social_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social connections" 
  ON public.social_connections 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create a table to store generated campaign content
CREATE TABLE public.campaign_generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'organic_post', 'paid_ad', 'email'
  media_type TEXT NOT NULL, -- 'image', 'video', 'copy'
  content_text TEXT,
  media_url TEXT,
  generated_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'generated',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security for campaign generated content
ALTER TABLE public.campaign_generated_content ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign generated content
CREATE POLICY "Users can view their campaign generated content" 
  ON public.campaign_generated_content 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_generated_content.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their campaign generated content" 
  ON public.campaign_generated_content 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_generated_content.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );
