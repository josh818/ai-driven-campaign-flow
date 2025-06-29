
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Award, Shield, Users } from 'lucide-react';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create account first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            company_name: companyName,
          }
        }
      });

      if (error) throw error;

      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { email, fullName, companyName }
      });

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout
      window.open(checkoutData.url, '_blank');
      
      toast({
        title: "Account Created!",
        description: "Please complete your payment to activate your professional service.",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-4">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Get Professional Campaigns</CardTitle>
        <p className="text-gray-600">$1,500/month • Expert-crafted campaigns</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name <span className="text-gray-400">(Optional)</span></Label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              placeholder="Enter your company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              placeholder="Create a secure password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating Your Account...
              </>
            ) : (
              <>
                <Award className="h-5 w-5 mr-2" />
                Start Professional Service
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              By signing up, you agree to our terms of service.
            </p>
            <p className="text-xs text-gray-500">
              🔒 Secure checkout powered by Stripe
            </p>
          </div>
        </form>

        {/* Trust Indicators */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <Shield className="h-6 w-6 text-green-500 mx-auto" />
              <p className="text-xs text-gray-600 font-medium">Secure</p>
            </div>
            <div className="space-y-1">
              <Award className="h-6 w-6 text-blue-500 mx-auto" />
              <p className="text-xs text-gray-600 font-medium">Expert Team</p>
            </div>
            <div className="space-y-1">
              <Users className="h-6 w-6 text-green-500 mx-auto" />
              <p className="text-xs text-gray-600 font-medium">Pro Results</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
