
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingData {
  id: string;
  user_id: string;
  company_description: string;
  target_audience: string;
  logo_url: string;
  office_image_url: string;
  onboarding_completed: boolean;
}

export const useOnboardingData = () => {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOnboardingData();
    }
  }, [user]);

  const fetchOnboardingData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding data:', error);
      } else {
        setOnboardingData(data);
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { onboardingData, isLoading, refetch: fetchOnboardingData };
};
