-- Add relevance scoring and categorization to brand_mentions
ALTER TABLE public.brand_mentions 
ADD COLUMN relevance_score text DEFAULT 'medium',
ADD COLUMN mention_category text DEFAULT 'general',
ADD COLUMN engagement_potential integer DEFAULT 1,
ADD COLUMN competitor_mention boolean DEFAULT false,
ADD COLUMN processed_by_ai boolean DEFAULT false;

-- Create notifications table for alerts
CREATE TABLE public.mention_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  mention_id uuid NOT NULL REFERENCES public.brand_mentions(id) ON DELETE CASCADE,
  notification_type text NOT NULL DEFAULT 'email',
  sent_at timestamp with time zone,
  webhook_url text,
  slack_channel text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mention_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can manage their own notifications" 
ON public.mention_notifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Add platform coverage tracking
CREATE TABLE public.platform_coverage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  platform_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  last_scan_at timestamp with time zone,
  scan_frequency_hours integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for platform coverage
ALTER TABLE public.platform_coverage ENABLE ROW LEVEL SECURITY;

-- Create policies for platform coverage
CREATE POLICY "Users can manage their platform coverage" 
ON public.platform_coverage 
FOR ALL 
USING (auth.uid() = user_id);

-- Add competitor keywords table
CREATE TABLE public.competitor_keywords (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  competitor_name text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for competitor keywords
ALTER TABLE public.competitor_keywords ENABLE ROW LEVEL SECURITY;

-- Create policies for competitor keywords
CREATE POLICY "Users can manage their competitor keywords" 
ON public.competitor_keywords 
FOR ALL 
USING (auth.uid() = user_id);

-- Insert default platforms
INSERT INTO public.platform_coverage (user_id, platform_name) 
SELECT auth.uid(), platform 
FROM unnest(ARRAY['X/Twitter', 'LinkedIn', 'Reddit', 'GitHub', 'YouTube', 'Hacker News', 'Stack Overflow', 'DEV.to']) as platform
WHERE auth.uid() IS NOT NULL;