import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ExternalLink, 
  Plus, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Brain,
  MessageSquare,
  Send,
  RefreshCw
} from 'lucide-react';
import Header from '@/components/Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define types for monitored terms since they're not in the generated types yet
type MonitoredTerm = {
  id: string;
  user_id: string;
  term: string;
  created_at: string;
  updated_at: string;
};

type BrandMention = {
  id: string;
  brand_name: string;
  mention_text: string;
  platform: string;
  sentiment: string | null;
  sentiment_score: number | null;
  confidence_score: number | null;
  site_priority: number | null;
  source_domain: string | null;
  url: string | null;
  mentioned_at: string;
  created_at: string;
  user_id: string;
};

const Reputation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentions, setMentions] = useState<BrandMention[]>([]);
  const [monitoredTerms, setMonitoredTerms] = useState<MonitoredTerm[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [trendResults, setTrendResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMention, setSelectedMention] = useState<BrandMention | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      const [mentionsResult, termsResult, trendsResult] = await Promise.all([
        supabase.from('brand_mentions').select('*').order('mentioned_at', { ascending: false }),
        supabase.from('monitored_terms').select('*').order('created_at', { ascending: false }),
        supabase.from('google_trends_data').select('*').order('trend_date', { ascending: true })
      ]);

      if (mentionsResult.error) throw mentionsResult.error;
      if (termsResult.error) throw termsResult.error;
      if (trendsResult.error) throw trendsResult.error;

      setMentions(mentionsResult.data || []);
      setMonitoredTerms(termsResult.data || []);
      setTrendsData(trendsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load reputation data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    
    setIsAddingKeyword(true);
    try {
      // Add to both Google Trends and Brand Mentions monitoring
      const mockScore = Math.floor(Math.random() * 100);
      
      const [trendsResult, termsResult] = await Promise.all([
        supabase.from('google_trends_data').insert([{
          keyword: newKeyword.trim(),
          interest_score: mockScore,
          user_id: user?.id
        }]),
        supabase.from('monitored_terms').insert([{
          term: newKeyword.trim(),
          user_id: user?.id
        }])
      ]);

      if (trendsResult.error) throw trendsResult.error;
      if (termsResult.error && !termsResult.error.message.includes('duplicate')) {
        throw termsResult.error;
      }

      setNewKeyword('');
      fetchAllData();
      searchTrendResults(newKeyword.trim());
      
      toast({
        title: "Success",
        description: `Now monitoring "${newKeyword}" across all channels`
      });
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast({
        title: "Error",
        description: "Failed to add keyword to monitoring",
        variant: "destructive"
      });
    } finally {
      setIsAddingKeyword(false);
    }
  };

  const searchTrendResults = async (keyword: string) => {
    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults = [
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

  const generateAIResponse = async (mention: BrandMention) => {
    setIsGeneratingResponse(true);
    setSelectedMention(mention);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const responses = {
        negative: "Thank you for your feedback! We appreciate you taking the time to share your experience. We'd love to learn more about how we can improve. Please reach out to our customer service team at your convenience.",
        positive: "Thank you so much for your kind words! We're thrilled to hear about your positive experience. Your feedback means the world to us and motivates our team to continue delivering excellent service.",
        neutral: "Thank you for taking the time to share your thoughts with us. We appreciate all feedback as it helps us improve our services. If you have any specific suggestions, we'd love to hear them."
      };
      
      setAiResponse(responses[mention.sentiment as keyof typeof responses] || responses.neutral);
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI response.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filteredMentions = mentions.filter(mention => 
    mention.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mention.mention_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
            <Shield className="h-8 w-8 text-teal-600" />
            <span>Brand Monitoring</span>
          </h2>
          <p className="text-gray-600">Monitor your brand across the web with comprehensive tracking and AI-powered insights</p>
        </div>

        <div className="space-y-6">
          {/* Keyword Management */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-6 w-6 text-blue-600" />
                <span>Add Keywords to Monitor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Enter brand name, product, or keyword to monitor..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button 
                  onClick={addKeyword}
                  disabled={isAddingKeyword}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                >
                  {isAddingKeyword ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Keywords are monitored across social media, news, forums, and search trends
              </p>
              <div className="flex flex-wrap gap-2">
                {monitoredTerms.map((term) => (
                  <Badge key={term.id} variant="secondary" className="px-3 py-1">
                    {term.term}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trends Chart */}
          {chartData.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <span>Keyword Popularity Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {trendResults.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-6 w-6 text-purple-600" />
                  <span>Latest Search Results</span>
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
                      <p className="text-gray-600">Searching for latest results...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brand Mentions */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <span>Brand Mentions & Sentiment Analysis</span>
              </CardTitle>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search mentions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchAllData} className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMentions.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentions found</h3>
                  <p className="text-gray-600">Brand mentions will appear here when detected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMentions.map((mention) => (
                    <div key={mention.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{mention.brand_name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{mention.platform}</Badge>
                            {mention.sentiment && (
                              <Badge className={getSentimentColor(mention.sentiment)}>
                                <div className="flex items-center space-x-1">
                                  {getSentimentIcon(mention.sentiment)}
                                  <span className="capitalize">{mention.sentiment}</span>
                                </div>
                              </Badge>
                            )}
                            {mention.sentiment === 'negative' && (
                              <Badge className="bg-orange-100 text-orange-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Needs Response
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{new Date(mention.mentioned_at).toLocaleDateString()}</p>
                          <p>{new Date(mention.mentioned_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{mention.mention_text}</p>
                      
                      <div className="flex items-center space-x-2">
                        {mention.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={mention.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Source
                            </a>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          onClick={() => generateAIResponse(mention)}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Response
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Response Generator */}
          {selectedMention && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <span>AI Response Generator</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGeneratingResponse ? (
                  <div className="flex items-center space-x-2 py-8">
                    <Brain className="h-8 w-8 animate-pulse text-purple-500" />
                    <span className="text-gray-600">Generating personalized response...</span>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600 mb-2">Responding to:</p>
                      <p className="font-medium">{selectedMention.mention_text}</p>
                    </div>
                    <Textarea 
                      value={aiResponse} 
                      onChange={(e) => setAiResponse(e.target.value)}
                      className="min-h-[120px]"
                      placeholder="AI-generated response will appear here..."
                    />
                    <div className="flex space-x-2">
                      <Button className="bg-gradient-to-r from-green-500 to-teal-500">
                        <Send className="h-4 w-4 mr-2" />
                        Send Response
                      </Button>
                      <Button variant="outline" onClick={() => generateAIResponse(selectedMention)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reputation;
