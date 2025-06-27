
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { user, loading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [user, loading]);

  const checkOnboardingStatus = async () => {
    try {
      // First try to check if onboarding_data table exists and has data
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('onboarding_data')
        .select('onboarding_completed')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!onboardingError && onboardingData) {
        setOnboardingCompleted(onboardingData.onboarding_completed || false);
      } else {
        // Fallback: assume onboarding not completed if no data found
        setOnboardingCompleted(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // If there's an error (like table doesn't exist), assume onboarding not completed
      setOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default OnboardingGuard;
