
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ContentPreviews from '@/components/ContentPreviews';
import SuggestedCampaigns from '@/components/SuggestedCampaigns';
import BrandMentionsList from '@/components/reputation/BrandMentionsList';
import HeroSection from '@/components/dashboard/HeroSection';
import StatsGrid from '@/components/dashboard/StatsGrid';
import QuickActionsGrid from '@/components/dashboard/QuickActionsGrid';
import ActivityInsights from '@/components/dashboard/ActivityInsights';
import MyCampaignsSection from '@/components/dashboard/MyCampaignsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />
        <StatsGrid dashboardStats={dashboardStats} />
        
        <div className="mb-8" data-id="suggested-campaigns">
          <SuggestedCampaigns />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                <BrandMentionsList
                  searchResults={[]}
                  searchTerm=""
                  onSearchTermChange={() => {}}
                  onRefresh={() => {}}
                  onGenerateAIResponse={() => {}}
                />
              </div>
            </CardContent>
          </Card>
          
          <MyCampaignsSection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-2">
            <QuickActionsGrid />
          </div>
          <ActivityInsights />
        </div>

        <div className="max-w-5xl">
          <ContentPreviews />
        </div>
      </main>
    </div>
  );
};

export default Index;
