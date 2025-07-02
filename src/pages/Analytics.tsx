import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Eye, MousePointer, DollarSign } from 'lucide-react';
import Header from '@/components/Header';
import BrandMentionsList from '@/components/reputation/BrandMentionsList';

interface Campaign {
  id: string;
  title: string;
  brand_name: string;
}

interface AnalyticsData {
  campaign_id: string;
  metric_name: string;
  metric_value: number;
  metric_date: string;
  platform: string;
}

const Analytics = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    if (user) {
      fetchCampaigns();
      fetchAnalytics();
    }
  }, [user, selectedCampaign, selectedPeriod]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title, brand_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      let query = supabase
        .from('campaign_analytics')
        .select(`
          *,
          campaigns!inner(title, brand_name, user_id)
        `)
        .eq('campaigns.user_id', user?.id);

      if (selectedCampaign !== 'all') {
        query = query.eq('campaign_id', selectedCampaign);
      }

      const { data, error } = await query.order('metric_date', { ascending: true });

      if (error) throw error;
      setAnalyticsData(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for demonstration since we don't have real analytics yet
  const mockData = [
    { date: '2024-01-01', impressions: 1200, clicks: 45, conversions: 8, spend: 120 },
    { date: '2024-01-02', impressions: 1350, clicks: 52, conversions: 12, spend: 135 },
    { date: '2024-01-03', impressions: 1100, clicks: 38, conversions: 6, spend: 110 },
    { date: '2024-01-04', impressions: 1400, clicks: 58, conversions: 15, spend: 140 },
    { date: '2024-01-05', impressions: 1600, clicks: 68, conversions: 18, spend: 160 },
    { date: '2024-01-06', impressions: 1300, clicks: 48, conversions: 10, spend: 130 },
    { date: '2024-01-07', impressions: 1500, clicks: 62, conversions: 14, spend: 150 },
  ];

  const platformData = [
    { name: 'Facebook', value: 35, color: '#1877f2' },
    { name: 'Instagram', value: 28, color: '#e4405f' },
    { name: 'Twitter', value: 20, color: '#1da1f2' },
    { name: 'LinkedIn', value: 12, color: '#0077b5' },
    { name: 'TikTok', value: 5, color: '#000000' },
  ];

  const totalImpressions = mockData.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = mockData.reduce((sum, item) => sum + item.clicks, 0);
  const totalConversions = mockData.reduce((sum, item) => sum + item.conversions, 0);
  const totalSpend = mockData.reduce((sum, item) => sum + item.spend, 0);
  const ctr = totalClicks / totalImpressions * 100;
  const conversionRate = totalConversions / totalClicks * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your campaign performance and brand mentions</p>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="brand-monitoring">Brand Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-3xl font-bold text-gray-900">Performance</p>
                <p className="text-gray-600">Monitor your campaign performance</p>
              </div>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Impressions</p>
                      <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
                      <p className="text-xs text-green-600 font-medium">+12.3%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Clicks</p>
                      <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
                      <p className="text-xs text-green-600 font-medium">+8.7%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <MousePointer className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">CTR</p>
                      <p className="text-2xl font-bold text-gray-900">{ctr.toFixed(2)}%</p>
                      <p className="text-xs text-green-600 font-medium">+2.1%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversions</p>
                      <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
                      <p className="text-xs text-green-600 font-medium">+15.4%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Spend</p>
                      <p className="text-2xl font-bold text-gray-900">${totalSpend}</p>
                      <p className="text-xs text-red-600 font-medium">+5.2%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                  <CardDescription>Daily metrics for the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                      <Legend />
                      <Line type="monotone" dataKey="impressions" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="conversions" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>Traffic breakdown by platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Spend Analysis */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Spend Analysis</CardTitle>
                <CardDescription>Daily advertising spend and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Legend />
                    <Bar dataKey="spend" fill="#8884d8" />
                    <Bar dataKey="conversions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brand-monitoring">
            <BrandMentionsList
              searchResults={[]}
              searchTerm=""
              onSearchTermChange={() => {}}
              onRefresh={() => {}}
              onGenerateAIResponse={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
