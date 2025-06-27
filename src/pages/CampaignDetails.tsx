
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Target, DollarSign } from 'lucide-react';
import Header from '@/components/Header';
import CampaignContentViewer from '@/components/CampaignContentViewer';
import { Database } from '@/integrations/supabase/types';

type Campaign = Database['public']['Tables']['campaigns']['Row'];

const CampaignDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchCampaign();
    }
  }, [user, id]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Campaign Header */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{campaign.title}</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {campaign.brand_name}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">{campaign.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Start Date</div>
                      <div className="font-medium">
                        {campaign.start_date 
                          ? new Date(campaign.start_date).toLocaleDateString() 
                          : 'Not set'
                        }
                      </div>
                    </div>
                  </div>
                  
                  {campaign.budget && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Budget</div>
                        <div className="font-medium">${campaign.budget.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Target Audience</div>
                      <div className="font-medium">{campaign.target_audience || 'General'}</div>
                    </div>
                  </div>
                </div>

                {campaign.campaign_goals && campaign.campaign_goals.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Campaign Goals</div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.campaign_goals.map((goal, index) => (
                        <Badge key={index} variant="secondary">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated Content */}
          <CampaignContentViewer campaignId={campaign.id} />
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
