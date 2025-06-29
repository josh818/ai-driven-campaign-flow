
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignupSuccess = () => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    if (user) {
      verifySubscription();
    }
  }, [user]);

  const verifySubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error verifying subscription:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p>Verifying your subscription...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              BiggerBite Campaign Manager
            </h1>
          </div>
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-800">Welcome to BiggerBite!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your account has been created successfully and your subscription is now active.
          </p>
          
          {subscriptionStatus?.subscribed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">Subscription Active</p>
              <p className="text-green-600 text-sm">
                Your premium features are now available!
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Link to="/">Get Started</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/settings">Manage Subscription</Link>
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Need help? Contact our support team anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupSuccess;
