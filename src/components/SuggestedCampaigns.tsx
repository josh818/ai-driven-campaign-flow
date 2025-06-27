
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Target, 
  ArrowRight, 
  Plus,
  Star,
  Users,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type SuggestedCampaign = Database['public']['Tables']['suggested_campaigns']['Row'];

const SuggestedCampaigns = () => {
  const { user } = useAuth();
  const [suggestedCampaigns, setSuggestedCampaigns] = useState<SuggestedCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSuggestedCampaigns();
    }
  }, [user]);

  const fetchSuggestedCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('suggested_campaigns')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(6);

      if (error) throw error;
      setSuggestedCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching suggested campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding': return <Users className="h-4 w-4" />;
      case 'promotional': return <Star className="h-4 w-4" />;
      case 'feedback': return <Target className="h-4 w-4" />;
      case 'newsletter': return <Mail className="h-4 w-4" />;
      case 'retention': return <ArrowRight className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'onboarding': return 'bg-blue-100 text-blue-800';
      case 'promotional': return 'bg-green-100 text-green-800';
      case 'feedback': return 'bg-purple-100 text-purple-800';
      case 'newsletter': return 'bg-orange-100 text-orange-800';
      case 'retention': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <span>Suggested Campaigns</span>
        </CardTitle>
        <CardDescription>
          AI-powered campaign suggestions to boost your marketing efforts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestedCampaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No campaign suggestions available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(campaign.category || 'general')}
                    <Badge variant="secondary" className={getCategoryColor(campaign.category || 'general')}>
                      {campaign.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: campaign.priority || 1 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {campaign.title}
                </h4>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {campaign.description}
                </p>
                
                {campaign.target_audience && (
                  <p className="text-xs text-blue-600 mb-3">
                    Target: {campaign.target_audience}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {campaign.suggested_goals?.slice(0, 2).map((goal, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {goal.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                  
                  <Link 
                    to={`/create-campaign?suggested=${campaign.id}`}
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <span>Use</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-center mt-6">
          <Link to="/create-campaign">
            <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Campaign
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedCampaigns;
