
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
  AlertTriangle,
  Sparkles,
  Rocket,
  Brain,
  Clock
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
      change: dashboardStats.isLoading ? '...' : '+2.5%',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      name: 'Total Reach', 
      value: dashboardStats.totalReach, 
      icon: Users, 
      change: dashboardStats.isLoading ? '...' : '+12.3%',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      name: 'Engagement Rate', 
      value: dashboardStats.engagementRate, 
      icon: TrendingUp, 
      change: dashboardStats.isLoading ? '...' : '+0.8%',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      name: 'Brand Mentions', 
      value: dashboardStats.brandMentions, 
      icon: Shield, 
      change: dashboardStats.isLoading ? '...' : '+5 this week',
      color: 'from-orange-500 to-red-500'
    },
  ];

  const quickActions = [
    { 
      name: 'Create Campaign', 
      icon: PlusCircle, 
      color: 'from-blue-500 to-cyan-500', 
      href: '/create-campaign',
      description: 'Launch new AI-powered campaigns'
    },
    { 
      name: 'Reputation Manager', 
      icon: Shield, 
      color: 'from-teal-500 to-green-500', 
      href: '/reputation',
      description: 'Monitor brand mentions'
    },
    { 
      name: 'View Calendar', 
      icon: Calendar, 
      color: 'from-cyan-500 to-blue-500', 
      href: '/calendar',
      description: 'Schedule content releases'
    },
    { 
      name: 'Analytics', 
      icon: BarChart3, 
      color: 'from-green-500 to-teal-500', 
      href: '/analytics',
      description: 'Track performance metrics'
    },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI Content Generation',
      description: 'Create compelling campaigns with our advanced AI that understands your brand voice.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Shield,
      title: 'Brand Monitoring',
      description: 'Real-time monitoring of brand mentions across all major platforms and social media.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into campaign performance with actionable recommendations.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'Optimize posting times with AI-powered scheduling for maximum engagement.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="relative px-8 py-12 md:py-16">
            <div className="text-center text-white">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <Rocket className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Welcome back, 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  {user?.user_metadata?.full_name?.split(' ')[0] || 'Champion'}! 🚀
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Your AI-powered campaign command center is ready. Monitor your brand, create compelling content, and watch your engagement soar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl">
                  <Link to="/create-campaign">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create New Campaign
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 rounded-xl">
                  <Link to="/analytics">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <Card key={stat.name} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {dashboardStats.isLoading ? (
                        <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block"></span>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-sm font-medium text-emerald-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Features Showcase */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Supercharge Your Marketing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leverage cutting-edge AI and analytics to transform your brand's digital presence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Suggested Campaigns Section */}
        <div className="mb-8">
          <SuggestedCampaigns />
        </div>

        {/* Brand Monitoring Section */}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Enhanced Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Jump into your most powerful tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link key={action.name} to={action.href}>
                      <Card className="border-2 hover:border-teal-300 transition-all duration-200 hover:shadow-lg group hover:-translate-y-1 cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <div className={`inline-flex p-3 bg-gradient-to-br ${action.color} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Enhanced Activity and Insights */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-green-50">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Campaign "Summer Sale" published</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-orange-50">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Brand mention detected</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">AI generated 3 new ideas</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-teal-50">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Response drafted for review</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-teal-600" />
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <p className="text-gray-700 font-medium">🛡️ Brand sentiment: <span className="text-green-600 font-bold">82% positive</span></p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                    <p className="text-gray-700 font-medium">⚡ Response time: <span className="text-blue-600 font-bold">2.3 hours avg</span></p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <p className="text-gray-700 font-medium">🎯 Top platforms: <span className="text-purple-600 font-bold">Twitter & Reddit</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Previews Section */}
        <div className="max-w-5xl">
          <ContentPreviews />
        </div>
      </main>
    </div>
  );
};

export default Index;
