
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Plus, RefreshCw, ExternalLink, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface GoogleTrendsData {
  id: string;
  keyword: string;
  interest_score: number;
  trend_date: string;
  geo_location: string;
}

interface TrendResult {
  keyword: string;
  title: string;
  link: string;
  snippet: string;
  source: string;
}

const GoogleTrendsChart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trendsData, setTrendsData] = useState<GoogleTrendsData[]>([]);
  const [trendResults, setTrendResults] = useState<TrendResult[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
      // Add to both trends monitoring and brand mentions monitoring
      const mockScore = Math.floor(Math.random() * 100);
      
      // Add to Google Trends
      const { error: trendsError } = await supabase
        .from('google_trends_data')
        .insert([{
          keyword: newKeyword.trim(),
          interest_score: mockScore,
          user_id: user?.id
        }]);

      if (trendsError) throw trendsError;

      // Add to monitored terms for brand mentions
      const { error: termsError } = await supabase
        .from('monitored_terms')
        .insert([{
          term: newKeyword.trim(),
          user_id: user?.id
        }]);

      // Don't throw error if term already exists in monitored_terms
      if (termsError && !termsError.message.includes('duplicate')) {
        throw termsError;
      }

      setNewKeyword('');
      fetchTrendsData();
      searchTrendResults(newKeyword.trim());
      
      toast({
        title: "Success",
        description: `Added ${newKeyword} to monitoring (Google Trends & Brand Mentions)`
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

  const searchTrendResults = async (keyword: string) => {
    setIsSearching(true);
    try {
      // Simulate fetching Google search results for trending topics
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults: TrendResult[] = [
        {
          keyword,
          title: `${keyword} - Latest News and Updates`,
          link: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
          snippet: `Recent developments and trending topics related to ${keyword}...`,
          source: 'Google Search'
        },
        {
          keyword,
          title: `${keyword} on Social Media`,
          link: `https://twitter.com/search?q=${encodeURIComponent(keyword)}`,
          snippet: `Social media conversations and mentions about ${keyword}...`,
          source: 'Twitter'
        },
        {
          keyword,
          title: `${keyword} News Articles`,
          link: `https://news.google.com/search?q=${encodeURIComponent(keyword)}`,
          snippet: `Latest news articles and press coverage about ${keyword}...`,
          source: 'Google News'
        },
        {
          keyword,
          title: `${keyword} Reddit Discussions`,
          link: `https://www.reddit.com/search/?q=${encodeURIComponent(keyword)}`,
          snippet: `Community discussions and opinions about ${keyword}...`,
          source: 'Reddit'
        }
      ];
      
      setTrendResults(prev => [...prev.filter(r => r.keyword !== keyword), ...mockResults]);
    } catch (error) {
      console.error('Error searching trend results:', error);
    } finally {
      setIsSearching(false);
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
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span>Google Trends Analysis & Search Results</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter keyword to track and search..."
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
          <p className="text-sm text-gray-600">
            Keywords added here will be monitored in both Google Trends and Brand Mentions
          </p>
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

      {trendResults.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-green-600" />
              <span>Trending Search Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Badge variant="secondary" className="mb-2">{result.keyword}</Badge>
                      <h3 className="font-semibold text-lg">{result.title}</h3>
                    </div>
                    <Badge variant="outline">{result.source}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{result.snippet}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={result.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Results
                    </a>
                  </Button>
                </div>
              ))}
              {isSearching && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className="text-gray-600">Searching for trending results...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoogleTrendsChart;
