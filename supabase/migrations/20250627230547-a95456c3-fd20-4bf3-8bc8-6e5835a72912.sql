
-- Create admin roles table
CREATE TABLE public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  category TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign emails table (to associate campaigns with emails)
CREATE TABLE public.campaign_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  email_template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suggested campaigns table
CREATE TABLE public.suggested_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  target_audience TEXT,
  suggested_goals TEXT[],
  template_content TEXT,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user campaign assignments table (for admins to assign campaigns to users)
CREATE TABLE public.user_campaign_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  assignment_notes TEXT,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assigned_to_user_id, campaign_id)
);

-- Enable Row Level Security on all new tables
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_campaign_assignments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_id = $1
  );
$$;

-- RLS Policies for admin_roles (only admins can manage admin roles)
CREATE POLICY "Admins can view admin roles" ON public.admin_roles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can create admin roles" ON public.admin_roles
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update admin roles" ON public.admin_roles
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete admin roles" ON public.admin_roles
  FOR DELETE USING (public.is_admin());

-- RLS Policies for email_templates (only admins can manage templates)
CREATE POLICY "Admins can view email templates" ON public.email_templates
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can create email templates" ON public.email_templates
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update email templates" ON public.email_templates
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete email templates" ON public.email_templates
  FOR DELETE USING (public.is_admin());

-- RLS Policies for campaign_emails
CREATE POLICY "Admins can view all campaign emails" ON public.campaign_emails
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can view their campaign emails" ON public.campaign_emails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_emails.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );
CREATE POLICY "Admins can create campaign emails" ON public.campaign_emails
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update campaign emails" ON public.campaign_emails
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete campaign emails" ON public.campaign_emails
  FOR DELETE USING (public.is_admin());

-- RLS Policies for suggested_campaigns
CREATE POLICY "Everyone can view active suggested campaigns" ON public.suggested_campaigns
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all suggested campaigns" ON public.suggested_campaigns
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can create suggested campaigns" ON public.suggested_campaigns
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update suggested campaigns" ON public.suggested_campaigns
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete suggested campaigns" ON public.suggested_campaigns
  FOR DELETE USING (public.is_admin());

-- RLS Policies for user_campaign_assignments
CREATE POLICY "Admins can view all assignments" ON public.user_campaign_assignments
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can view their assignments" ON public.user_campaign_assignments
  FOR SELECT USING (assigned_to_user_id = auth.uid());
CREATE POLICY "Admins can create assignments" ON public.user_campaign_assignments
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update assignments" ON public.user_campaign_assignments
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete assignments" ON public.user_campaign_assignments
  FOR DELETE USING (public.is_admin());

-- Insert some sample suggested campaigns
INSERT INTO public.suggested_campaigns (title, description, category, target_audience, suggested_goals, template_content, priority) VALUES
('Welcome Email Series', 'A 3-part welcome email series for new subscribers', 'onboarding', 'New subscribers', ARRAY['increase_engagement', 'build_brand_awareness'], 'Welcome to our community! Here''s what you can expect...', 5),
('Seasonal Promotion', 'Promote seasonal products and services', 'promotional', 'Existing customers', ARRAY['increase_sales', 'boost_revenue'], 'Don''t miss our limited-time seasonal offers...', 4),
('Customer Feedback Survey', 'Gather feedback from recent customers', 'feedback', 'Recent customers', ARRAY['improve_products', 'increase_satisfaction'], 'We''d love to hear about your recent experience...', 3),
('Newsletter Campaign', 'Monthly newsletter with updates and tips', 'newsletter', 'All subscribers', ARRAY['build_brand_awareness', 'increase_engagement'], 'Here''s what''s new this month...', 2),
('Re-engagement Campaign', 'Win back inactive subscribers', 'retention', 'Inactive subscribers', ARRAY['increase_engagement', 'reduce_churn'], 'We miss you! Here''s what you''ve been missing...', 4);
