
-- Create a table to store monitored terms for reputation management
CREATE TABLE public.monitored_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  term TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, term)
);

-- Add Row Level Security
ALTER TABLE public.monitored_terms ENABLE ROW LEVEL SECURITY;

-- Create policies for monitored terms
CREATE POLICY "Users can view their own monitored terms" 
  ON public.monitored_terms 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own monitored terms" 
  ON public.monitored_terms 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add RLS policies for brand_mentions table (if not already exists)
ALTER TABLE public.brand_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand mentions" 
  ON public.brand_mentions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own brand mentions" 
  ON public.brand_mentions 
  FOR ALL 
  USING (auth.uid() = user_id);
