
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Check } from 'lucide-react';

const Signup = () => {
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
        description: "Please complete your payment to activate your subscription.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Features */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">BB</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              BiggerBite Campaign Manager
            </h1>
          </div>
          
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Join BiggerBite Premium
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Supercharge your marketing campaigns with AI-powered content generation and advanced analytics.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Unlimited campaigns</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">AI content generation</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Advanced analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Brand monitoring</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Priority support</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">$15/month</div>
              <div className="text-gray-600">Cancel anytime</div>
            </div>
          </div>
        </div>

        {/* Right side - Signup form */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Sign Up & Subscribe
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-600 text-center">
                By signing up, you agree to our terms of service and will be charged $15/month until you cancel.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
