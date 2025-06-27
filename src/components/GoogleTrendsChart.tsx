
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Plus, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GoogleTrendsData {
  id: string;
  keyword: string;
  interest_score: number;
  trend_date: string;
  geo_location: string;
}

const GoogleTrendsChart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trendsData, setTrendsData] = useState<GoogleTrendsData[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrendsData();
    }
  }, [user]);

  const fetchTrendsData = async () => {
    try {
      const { data, error } = await supabase
        .from('google_trends_data')
        .select('*')
        .order('trend_date', { ascending: true });

      if (error) throw error;
      setTrendsData(data || []);
    } catch (error) {
      console.error('Error fetching trends data:', error);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate Google Trends API call with mock data
      const mockScore = Math.floor(Math.random() * 100);
      
      const { error } = await supabase
        .from('google_trends_data')
        .insert([{
          keyword: newKeyword.trim(),
          interest_score: mockScore,
          user_id: user?.id
        }]);

      if (error) throw error;

      setNewKeyword('');
      fetchTrendsData();
      toast({
        title: "Success",
        description: `Added ${newKeyword} to Google Trends monitoring`
      });
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast({
        title: "Error",
        description: "Failed to add keyword to monitoring",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = trendsData.reduce((acc: any[], item) => {
    const existingDate = acc.find(d => d.date === item.trend_date);
    if (existingDate) {
      existingDate[item.keyword] = item.interest_score;
    } else {
      acc.push({
        date: item.trend_date,
        [item.keyword]: item.interest_score
      });
    }
    return acc;
  }, []);

  const uniqueKeywords = [...new Set(trendsData.map(item => item.keyword))];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <span>Google Trends Analysis</span>
        </CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter keyword to track..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
          />
          <Button 
            onClick={addKeyword}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              {uniqueKeywords.map((keyword, index) => (
                <Line
                  key={keyword}
                  type="monotone"
                  dataKey={keyword}
                  stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No trending data available. Add keywords to start tracking.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleTrendsChart;
