
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
  Plus, 
  Shield,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Brain,
  MessageSquare,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp
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

type SearchResult = {
  id: string;
  keyword: string;
  title: string;
  snippet: string;
  fullContent: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  confidence: number;
  suggestedResponse?: string;
  platform: string;
  publishedAt: string;
};

const Reputation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentions, setMentions] = useState<BrandMention[]>([]);
  const [monitoredTerms, setMonitoredTerms] = useState<MonitoredTerm[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
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
      searchBrandMentions(newKeyword.trim());
      
      toast({
        title: "Success",
        description: `Now monitoring "${newKeyword}" for brand mentions and trends`
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

  const searchBrandMentions = async (keyword: string) => {
    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate AI-powered sentiment analysis and content generation
      const mockResults: SearchResult[] = [
        {
          id: `${keyword}-1`,
          keyword,
          title: `Great experience with ${keyword} - highly recommend!`,
          snippet: `I've been using ${keyword} for months now and absolutely love it. The customer service is exceptional...`,
          fullContent: `I've been using ${keyword} for months now and absolutely love it. The customer service is exceptional and the product quality exceeds expectations. I would definitely recommend this to anyone looking for a reliable solution. The team has been incredibly responsive to my questions and the onboarding process was smooth. Overall, this has been one of my best purchases this year.`,
          source: 'Twitter',
          sentiment: 'positive',
          sentimentScore: 0.8,
          confidence: 0.92,
          platform: 'Social Media',
          publishedAt: '2 hours ago',
          suggestedResponse: "Thank you so much for your wonderful review! We're thrilled to hear about your positive experience with our product and team. Your feedback means the world to us and motivates us to continue delivering exceptional service."
        },
        {
          id: `${keyword}-2`,
          keyword,
          title: `${keyword} disappointed me - not what I expected`,
          snippet: `Unfortunately, my experience with ${keyword} hasn't been great. The product didn't meet my expectations...`,
          fullContent: `Unfortunately, my experience with ${keyword} hasn't been great. The product didn't meet my expectations and I've had several issues with the setup process. Customer support took too long to respond and when they did, the solution didn't work. I'm considering switching to a competitor if things don't improve soon. Really hoped this would work better.`,
          source: 'Reddit',
          sentiment: 'negative',
          sentimentScore: -0.7,
          confidence: 0.88,
          platform: 'Forum',
          publishedAt: '5 hours ago',
          suggestedResponse: "We sincerely apologize for your disappointing experience. This is not the level of service we strive for. Please reach out to our customer success team directly so we can make this right and address your concerns promptly."
        },
        {
          id: `${keyword}-3`,
          keyword,
          title: `Neutral review: ${keyword} is okay, nothing special`,
          snippet: `I've tried ${keyword} and it's decent. Not amazing, not terrible, just average...`,
          fullContent: `I've tried ${keyword} and it's decent. Not amazing, not terrible, just average. It does what it's supposed to do but there are probably better options out there. The price is fair for what you get. Would I buy it again? Maybe, if there were no other choices. It's fine for basic needs but lacks some advanced features I was hoping for.`,
          source: 'Google Reviews',
          sentiment: 'neutral',
          sentimentScore: 0.1,
          confidence: 0.85,
          platform: 'Review Site',
          publishedAt: '1 day ago',
          suggestedResponse: "Thank you for taking the time to share your honest feedback. We appreciate all reviews as they help us improve. We'd love to learn more about the advanced features you were looking for - please feel free to reach out with suggestions."
        },
        {
          id: `${keyword}-4`,
          keyword,
          title: `Breaking: ${keyword} announces new partnership`,
          snippet: `${keyword} has just announced a strategic partnership that could change the industry...`,
          fullContent: `${keyword} has just announced a strategic partnership that could change the industry landscape. This collaboration brings together two leading companies to deliver innovative solutions. Industry experts are calling this a game-changing move that could benefit customers significantly. The partnership is expected to launch new features and improved services by next quarter.`,
          source: 'TechCrunch',
          sentiment: 'positive',
          sentimentScore: 0.6,
          confidence: 0.90,
          platform: 'News',
          publishedAt: '3 hours ago',
          suggestedResponse: "Thank you for covering our partnership announcement! We're excited about this collaboration and the value it will bring to our customers. Stay tuned for more updates on the innovative solutions we'll be launching together."
        }
      ];
      
      setSearchResults(prev => [...prev.filter(r => r.keyword !== keyword), ...mockResults]);
    } catch (error) {
      console.error('Error searching brand mentions:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const generateAIResponse = async (result: SearchResult) => {
    setIsGeneratingResponse(true);
    setSelectedResult(result);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiResponse(result.suggestedResponse || '');
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

  const toggleExpanded = (resultId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
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

  const filteredResults = searchResults.filter(result => 
    result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.keyword.toLowerCase().includes(searchTerm.toLowerCase())
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
            <span>Brand Monitoring & Sentiment Analysis</span>
          </h2>
          <p className="text-gray-600">Monitor your brand across the web with AI-powered sentiment analysis and automated response suggestions</p>
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
                Keywords are monitored across social media, news, forums, and review sites with AI sentiment analysis
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

          {/* Brand Mentions with Integrated Sentiment Analysis */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <span>Brand Mentions & AI Analysis</span>
              </CardTitle>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search mentions and content..."
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
              {filteredResults.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No brand mentions found</h3>
                  <p className="text-gray-600">Add keywords above to start monitoring brand mentions</p>
                  {isSearching && (
                    <div className="mt-4">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                      <p className="text-gray-600">Searching for brand mentions...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <div key={result.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary">{result.keyword}</Badge>
                            <Badge variant="outline">{result.platform}</Badge>
                            <Badge className={getSentimentColor(result.sentiment)}>
                              <div className="flex items-center space-x-1">
                                {getSentimentIcon(result.sentiment)}
                                <span className="capitalize">{result.sentiment}</span>
                                <span className="text-xs">({(result.confidence * 100).toFixed(0)}%)</span>
                              </div>
                            </Badge>
                            {result.sentiment === 'negative' && (
                              <Badge className="bg-orange-100 text-orange-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Action Needed
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{result.title}</h3>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{result.publishedAt}</p>
                          <p className="text-xs">Score: {result.sentimentScore > 0 ? '+' : ''}{result.sentimentScore.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">
                        {expandedResults.has(result.id) ? result.fullContent : result.snippet}
                      </p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleExpanded(result.id)}
                        >
                          {expandedResults.has(result.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Read More
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => generateAIResponse(result)}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Response
                        </Button>
                      </div>

                      {/* AI Suggested Response */}
                      {result.suggestedResponse && (
                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <h5 className="font-semibold text-sm mb-2 flex items-center">
                            <Brain className="h-4 w-4 mr-2 text-blue-600" />
                            AI Suggested Response
                          </h5>
                          <p className="text-sm text-gray-700 mb-2">{result.suggestedResponse}</p>
                          <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-500">
                            <Send className="h-4 w-4 mr-2" />
                            Use Response
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Response Generator Modal-like Section */}
          {selectedResult && aiResponse && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <span>Customize AI Response</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGeneratingResponse ? (
                  <div className="flex items-center space-x-2 py-8">
                    <Brain className="h-8 w-8 animate-pulse text-purple-500" />
                    <span className="text-gray-600">Generating personalized response...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600 mb-2">Responding to:</p>
                      <p className="font-medium">{selectedResult.title}</p>
                      <Badge className={getSentimentColor(selectedResult.sentiment)} size="sm">
                        {selectedResult.sentiment}
                      </Badge>
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
                      <Button variant="outline" onClick={() => generateAIResponse(selectedResult)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedResult(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reputation;
