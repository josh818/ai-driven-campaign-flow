
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Crown, Check, X } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Subscriber = Database['public']['Tables']['subscribers']['Row'];

const plans = [
  {
    name: 'Basic',
    tier: 'basic' as const,
    price: '$29/month',
    features: [
      'Up to 5 campaigns',
      'Basic analytics',
      'Email support',
      'Content templates'
    ],
    limitations: [
      'No AI content generation',
      'Limited brand monitoring'
    ]
  },
  {
    name: 'Premium',
    tier: 'premium' as const,
    price: '$99/month',
    features: [
      'Unlimited campaigns',
      'Advanced analytics',
      'AI content generation',
      'Multi-channel management',
      'Brand monitoring',
      'Priority support'
    ],
    limitations: [
      'Standard API limits'
    ]
  },
  {
    name: 'Enterprise',
    tier: 'enterprise' as const,
    price: '$299/month',
    features: [
      'Everything in Premium',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced brand monitoring',
      'Custom analytics',
      'SLA guarantee'
    ],
    limitations: []
  }
];

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscriber | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    // In a real app, this would integrate with Stripe
    toast({
      title: "Coming Soon",
      description: "Stripe integration will be implemented for payment processing.",
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subscription && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span>Current Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-purple-100 text-purple-800 capitalize">
                  {subscription.subscription_tier || 'Free'}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Status: {subscription.subscribed ? 'Active' : 'Inactive'}
                </p>
                {subscription.subscription_end && (
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(subscription.subscription_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.tier} className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm relative ${
            subscription?.subscription_tier === plan.tier ? 'ring-2 ring-purple-500' : ''
          }`}>
            {plan.tier === 'premium' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-purple-600">{plan.price}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">Included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              {plan.limitations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700">Limitations:</h4>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <X className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => handleSubscribe(plan.tier)}
                disabled={subscription?.subscription_tier === plan.tier}
              >
                {subscription?.subscription_tier === plan.tier ? 'Current Plan' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionManagement;
