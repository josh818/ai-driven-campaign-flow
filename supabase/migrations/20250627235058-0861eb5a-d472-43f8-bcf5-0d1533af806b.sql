
-- Add tables for Google Trends data and site prioritization
CREATE TABLE public.google_trends_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  keyword TEXT NOT NULL,
  interest_score INTEGER NOT NULL,
  geo_location TEXT DEFAULT 'US',
  time_period TEXT DEFAULT 'today 12-m',
  trend_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add site prioritization table
CREATE TABLE public.site_priorities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  site_name TEXT NOT NULL,
  priority_score INTEGER NOT NULL DEFAULT 1 CHECK (priority_score >= 1 AND priority_score <= 10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, site_name)
);

-- Update brand_mentions table to add sentiment analysis and site priority
ALTER TABLE public.brand_mentions 
ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
ADD COLUMN IF NOT EXISTS site_priority INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS source_domain TEXT;

-- Add RLS policies for new tables
ALTER TABLE public.google_trends_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_priorities ENABLE ROW LEVEL SECURITY;

-- Google Trends policies
CREATE POLICY "Users can view their own trends data" 
  ON public.google_trends_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own trends data" 
  ON public.google_trends_data 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Site priorities policies
CREATE POLICY "Users can view their own site priorities" 
  ON public.site_priorities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own site priorities" 
  ON public.site_priorities 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Insert default high-priority sites
INSERT INTO public.site_priorities (site_name, priority_score, user_id) 
SELECT 'twitter.com', 9, id FROM auth.users ON CONFLICT DO NOTHING;

INSERT INTO public.site_priorities (site_name, priority_score, user_id) 
SELECT 'facebook.com', 8, id FROM auth.users ON CONFLICT DO NOTHING;

INSERT INTO public.site_priorities (site_name, priority_score, user_id) 
SELECT 'instagram.com', 8, id FROM auth.users ON CONFLICT DO NOTHING;

INSERT INTO public.site_priorities (site_name, priority_score, user_id) 
SELECT 'linkedin.com', 7, id FROM auth.users ON CONFLICT DO NOTHING;

INSERT INTO public.site_priorities (site_name, priority_score, user_id) 
SELECT 'reddit.com', 6, id FROM auth.users ON CONFLICT DO NOTHING;
