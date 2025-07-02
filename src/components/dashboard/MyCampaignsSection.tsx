import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Eye, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Campaign = Database['public']['Tables']['campaigns']['Row'];

const MyCampaignsSection = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentCampaigns();
    }
  }, [user]);

  const fetchRecentCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
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

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>My Campaigns</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Your recent marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-1 pb-3">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-1">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>My Campaigns</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Your recent marketing campaigns
            </CardDescription>
          </div>
          <Link to="/create-campaign">
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-1 pb-3">
        {campaigns.length === 0 ? (
          <div className="text-center py-4">
            <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">No campaigns yet</p>
            <Link to="/create-campaign">
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Create Your First Campaign
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-2 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{campaign.title}</h4>
                      <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{campaign.brand_name}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'No date set'}
                    </div>
                  </div>
                  <Link to={`/campaigns/${campaign.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <Link to="/campaigns">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View All Campaigns
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyCampaignsSection;