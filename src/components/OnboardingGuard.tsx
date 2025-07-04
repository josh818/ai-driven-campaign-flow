
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
      // Check if user has completed basic profile setup
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('id', user!.id)
        .single();

      if (!profileError && profileData) {
        // Consider onboarding complete if user has both name and company
        const hasBasicInfo = !!(profileData.full_name && profileData.company_name);
        setOnboardingCompleted(hasBasicInfo);
      } else {
        setOnboardingCompleted(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
