
-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  brand_name TEXT,
  target_audience TEXT,
  campaign_goals TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  budget DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign content table for AI-generated content
CREATE TABLE public.campaign_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('copy', 'image', 'video', 'email', 'social_post')),
  content_text TEXT,
  media_url TEXT,
  platform TEXT, -- for social media specific content
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'scheduled', 'published')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brand mentions table for reputation monitoring
CREATE TABLE public.brand_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_name TEXT NOT NULL,
  mention_text TEXT NOT NULL,
  platform TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  url TEXT,
  mentioned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table
CREATE TABLE public.campaign_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, metric_name, metric_date, platform)
);

-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Users can view their own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for campaign content
CREATE POLICY "Users can view their campaign content" ON public.campaign_content
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_content.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));
CREATE POLICY "Users can create campaign content" ON public.campaign_content
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_content.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));
CREATE POLICY "Users can update their campaign content" ON public.campaign_content
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_content.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete their campaign content" ON public.campaign_content
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_content.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

-- RLS Policies for brand mentions
CREATE POLICY "Users can view their brand mentions" ON public.brand_mentions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create brand mentions" ON public.brand_mentions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their brand mentions" ON public.brand_mentions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their brand mentions" ON public.brand_mentions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for analytics
CREATE POLICY "Users can view their campaign analytics" ON public.campaign_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_analytics.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));
CREATE POLICY "Users can create campaign analytics" ON public.campaign_analytics
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_analytics.campaign_id 
    AND campaigns.user_id = auth.uid()
  ));

-- RLS Policies for subscribers
CREATE POLICY "Users can view their subscription" ON public.subscribers
  FOR SELECT USING (auth.uid() = user_id OR email = auth.email());
CREATE POLICY "Users can update their subscription" ON public.subscribers
  FOR UPDATE USING (auth.uid() = user_id OR email = auth.email());
CREATE POLICY "Edge functions can manage subscriptions" ON public.subscribers
  FOR ALL USING (true);
