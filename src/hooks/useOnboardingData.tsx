
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
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchOnboardingData = async () => {
    if (!user) return;

    try {
      // Try to fetch basic profile data as fallback
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        // Create a mock onboarding data structure from profile
        const mockOnboardingData: OnboardingData = {
          id: profileData.id,
          user_id: profileData.id,
          company_description: '',
          target_audience: '',
          logo_url: '',
          office_image_url: '',
          onboarding_completed: !!(profileData.full_name && profileData.company_name)
        };
        setOnboardingData(mockOnboardingData);
      } else {
        setOnboardingData(null);
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      setOnboardingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { onboardingData, isLoading, refetch: fetchOnboardingData };
};
