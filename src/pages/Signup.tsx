import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Check, Star, Zap, Shield, Brain, BarChart3, Clock, Users, Sparkles } from 'lucide-react';

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

  const features = [
    { icon: Brain, text: "AI-powered content generation", highlight: true },
    { icon: BarChart3, text: "Advanced analytics & insights", highlight: true },
    { icon: Shield, text: "Real-time brand monitoring", highlight: true },
    { icon: Clock, text: "Smart scheduling optimization", highlight: false },
    { icon: Users, text: "Multi-platform management", highlight: false },
    { icon: Zap, text: "Lightning-fast response tools", highlight: false }
  ];

  const testimonial = {
    text: "BiggerBite transformed our marketing strategy. We saw 300% increase in engagement within the first month!",
    author: "Sarah Chen",
    title: "Marketing Director, TechStart Inc.",
    rating: 5
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-12 items-center">
        {/* Left side - Enhanced Value Proposition */}
        <div className="lg:col-span-3 space-y-8">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">BB</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                BiggerBite
              </h1>
              <p className="text-lg text-gray-600 font-medium">Campaign Manager</p>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-purple-800 font-medium text-sm">AI-Powered Marketing Revolution</span>
            </div>
            
            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
              Transform Your 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Marketing Game
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Join thousands of marketers who've supercharged their campaigns with AI-powered content generation, 
              real-time brand monitoring, and advanced analytics that actually drive results.
            </p>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                  feature.highlight 
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-md' 
                    : 'bg-white/60 border border-gray-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg' 
                    : 'bg-gray-100'
                }`}>
                  <feature.icon className={`h-5 w-5 ${feature.highlight ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span className={`font-medium ${feature.highlight ? 'text-blue-900' : 'text-gray-700'}`}>
                  {feature.text}
                </span>
                {feature.highlight && <Check className="h-4 w-4 text-green-500 ml-auto" />}
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">SC</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-3">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Highlight */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-semibold">Limited Time Offer</span>
              </div>
              <div className="text-4xl font-bold text-green-700 mb-1">$15/month</div>
              <div className="text-green-600 mb-2">First 30 days free • Cancel anytime</div>
              <div className="text-sm text-green-700">Join 10,000+ marketers already using BiggerBite</div>
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Signup Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Start Your Free Trial</CardTitle>
              <p className="text-gray-600">No commitment • Full access • Cancel anytime</p>
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
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
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
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
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
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
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
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    placeholder="Create a secure password"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating Your Account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Start Free Trial & Subscribe
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
                    <Zap className="h-6 w-6 text-yellow-500 mx-auto" />
                    <p className="text-xs text-gray-600 font-medium">Instant Setup</p>
                  </div>
                  <div className="space-y-1">
                    <Users className="h-6 w-6 text-blue-500 mx-auto" />
                    <p className="text-xs text-gray-600 font-medium">10k+ Users</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
