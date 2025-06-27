
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ContentPreviews from '@/components/ContentPreviews';
import SuggestedCampaigns from '@/components/SuggestedCampaigns';
import BrandMonitoring from '@/components/BrandMonitoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Zap,
  TrendingUp,
  Users,
  Target,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    activeCampaigns: 'N/A',
    totalReach: 'N/A',
    engagementRate: 'N/A',
    brandMentions: 'N/A',
    isLoading: true
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch active campaigns count
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id', { count: 'exact' })
        .eq('user_id', user!.id)
        .eq('status', 'active');

      if (campaignsError) throw campaignsError;

      // Fetch brand mentions count for the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: mentionsData, error: mentionsError } = await supabase
        .from('brand_mentions')
        .select('id', { count: 'exact' })
        .gte('mentioned_at', oneWeekAgo.toISOString());

      if (mentionsError) throw mentionsError;

      // Fetch campaign analytics for reach and engagement (mock calculation for now)
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('campaign_analytics')
        .select('*')
        .in('campaign_id', campaignsData?.map(c => c.id) || []);

      if (analyticsError) throw analyticsError;

      // Calculate stats
      const activeCampaignsCount = campaignsData?.length || 0;
      const brandMentionsCount = mentionsData?.length || 0;
      
      // Mock calculations for reach and engagement based on available data
      const totalReach = analyticsData?.reduce((sum, metric) => {
        if (metric.metric_name === 'reach' || metric.metric_name === 'impressions') {
          return sum + Number(metric.metric_value);
        }
        return sum;
      }, 0) || 0;

      const engagementMetrics = analyticsData?.filter(metric => 
        metric.metric_name === 'engagement' || metric.metric_name === 'likes' || metric.metric_name === 'shares'
      ) || [];
      
      const avgEngagement = engagementMetrics.length > 0 
        ? engagementMetrics.reduce((sum, metric) => sum + Number(metric.metric_value), 0) / engagementMetrics.length
        : 0;

      setDashboardStats({
        activeCampaigns: activeCampaignsCount.toString(),
        totalReach: totalReach > 0 ? `${(totalReach / 1000).toFixed(1)}K` : '0',
        engagementRate: avgEngagement > 0 ? `${avgEngagement.toFixed(1)}%` : '0%',
        brandMentions: brandMentionsCount.toString(),
        isLoading: false
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardStats({
        activeCampaigns: '0',
        totalReach: '0',
        engagementRate: '0%',
        brandMentions: '0',
        isLoading: false
      });
    }
  };

  const stats = [
    { 
      name: 'Active Campaigns', 
      value: dashboardStats.activeCampaigns, 
      icon: Target, 
      change: dashboardStats.isLoading ? '...' : '+2.5%' 
    },
    { 
      name: 'Total Reach', 
      value: dashboardStats.totalReach, 
      icon: Users, 
      change: dashboardStats.isLoading ? '...' : '+12.3%' 
    },
    { 
      name: 'Engagement Rate', 
      value: dashboardStats.engagementRate, 
      icon: TrendingUp, 
      change: dashboardStats.isLoading ? '...' : '+0.8%' 
    },
    { 
      name: 'Brand Mentions', 
      value: dashboardStats.brandMentions, 
      icon: Shield, 
      change: dashboardStats.isLoading ? '...' : '+5 this week' 
    },
  ];

  const quickActions = [
    { name: 'Create Campaign', icon: PlusCircle, color: 'from-blue-500 to-cyan-500', href: '/create-campaign' },
    { name: 'Reputation Manager', icon: Shield, color: 'from-teal-500 to-green-500', href: '/reputation' },
    { name: 'View Calendar', icon: Calendar, color: 'from-cyan-500 to-blue-500', href: '/calendar' },
    { name: 'Analytics', icon: BarChart3, color: 'from-green-500 to-teal-500', href: '/analytics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'there'}! 👋
          </h2>
          <p className="text-gray-600">
            Monitor your brand reputation and manage your marketing campaigns.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats.isLoading ? (
                        <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block"></span>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-xs text-teal-600 font-medium">{stat.change}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Brand Monitoring Section - Reduced height by 55% */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="h-5 w-5 text-teal-600" />
                <span>Brand Monitoring</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Recent brand mentions and monitoring activity
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <div className="max-h-32 overflow-hidden">
                <BrandMonitoring />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Campaigns Section - Now directly under Brand Monitoring */}
        <div className="mb-8">
          <SuggestedCampaigns />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Quick Actions - Takes up 2.5 columns */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Jump into your most common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link key={action.name} to={action.href}>
                      <Button
                        variant="outline"
                        className="h-20 w-full flex-col space-y-2 border-2 hover:border-teal-300 transition-all duration-200"
                      >
                        <div className={`p-2 bg-gradient-to-br ${action.color} rounded-lg`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium">{action.name}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Activity and Reputation Insights - Takes up 1.5 columns each */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Campaign "Summer Sale" published</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Negative brand mention detected</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">AI generated 3 new post ideas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-600">Response drafted for review</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-teal-600" />
                  <span>Reputation Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">
                    🛡️ Your brand sentiment is <strong>82% positive</strong> this week.
                  </p>
                  <p className="text-gray-600">
                    📈 Response time to mentions: <strong>2.3 hours average</strong>.
                  </p>
                  <p className="text-gray-600">
                    🎯 Most mentions from <strong>Twitter</strong> and <strong>Reddit</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Schedule By Channel Section - Now positioned at the bottom */}
        <div className="max-w-5xl">
          <ContentPreviews />
        </div>
      </main>
    </div>
  );
};

export default Index;
