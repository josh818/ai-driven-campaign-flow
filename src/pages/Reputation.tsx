import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3
} from 'lucide-react';
import Header from '@/components/Header';
import GoogleTrendsChart from '@/components/GoogleTrendsChart';
import SitePriorityManager from '@/components/SitePriorityManager';
import SentimentAnalyzer from '@/components/SentimentAnalyzer';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMention, setSelectedMention] = useState<BrandMention | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [mentionsResult, termsResult] = await Promise.all([
        supabase.from('brand_mentions').select('*').order('mentioned_at', { ascending: false }),
        supabase.from('monitored_terms').select('*').order('created_at', { ascending: false })
      ]);

      if (mentionsResult.error) throw mentionsResult.error;
      if (termsResult.error) throw termsResult.error;

      setMentions(mentionsResult.data || []);
      setMonitoredTerms(termsResult.data || []);
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

  const addMonitoredTerm = async () => {
    if (!newTerm.trim()) return;

    try {
      const { error } = await supabase
        .from('monitored_terms')
        .insert([{ term: newTerm.trim(), user_id: user?.id }]);

      if (error) throw error;

      setNewTerm('');
      fetchData();
      toast({
        title: "Success",
        description: "Term added to monitoring list."
      });
    } catch (error) {
      console.error('Error adding term:', error);
      toast({
        title: "Error",
        description: "Failed to add term.",
        variant: "destructive"
      });
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

  const getPriorityBadge = (priority: number | null) => {
    if (!priority) return null;
    
    if (priority >= 8) return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
    if (priority >= 6) return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
    if (priority >= 4) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low</Badge>;
  };

  const generateAIResponse = async (mention: BrandMention) => {
    setIsGeneratingResponse(true);
    setSelectedMention(mention);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const responses = [
        "Thank you for your feedback! We appreciate you taking the time to share your experience. We'd love to learn more about how we can improve. Please reach out to our customer service team at your convenience.",
        "We're grateful for your review and take all feedback seriously. Your experience is important to us, and we're committed to making things right. Could you please contact us directly so we can address your concerns?",
        "Thank you for bringing this to our attention. We strive to provide the best possible experience for all our customers. We'd appreciate the opportunity to discuss this further and find a solution that works for you."
      ];
      
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
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
            <span>Reputation Management</span>
          </h2>
          <p className="text-gray-600">Monitor your brand mentions, analyze sentiment, and track Google Trends</p>
        </div>

        <Tabs defaultValue="mentions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="mentions">Brand Mentions</TabsTrigger>
            <TabsTrigger value="trends">Google Trends</TabsTrigger>
            <TabsTrigger value="priorities">Site Priorities</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="mentions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search brand mentions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={fetchData} className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
                    Refresh
                  </Button>
                </div>

                {filteredMentions.length === 0 ? (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center py-16">
                    <CardContent>
                      <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No brand mentions found</h3>
                      <p className="text-gray-600">Brand mentions will appear here when they are detected</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredMentions.map((mention) => (
                      <Card key={mention.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg font-semibold">{mention.brand_name}</CardTitle>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="secondary">{mention.platform}</Badge>
                                {mention.sentiment && (
                                  <Badge className={getSentimentColor(mention.sentiment)}>
                                    <div className="flex items-center space-x-1">
                                      {getSentimentIcon(mention.sentiment)}
                                      <span className="capitalize">{mention.sentiment}</span>
                                    </div>
                                  </Badge>
                                )}
                                {getPriorityBadge(mention.site_priority)}
                                {mention.sentiment === 'negative' && (
                                  <Badge className="bg-orange-100 text-orange-800">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Needs Response
                                  </Badge>
                                )}
                                {mention.source_domain && (
                                  <Badge variant="outline">{mention.source_domain}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>{new Date(mention.mentioned_at).toLocaleDateString()}</p>
                              <p>{new Date(mention.mentioned_at).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4">{mention.mention_text}</p>
                          {(mention.sentiment_score !== null || mention.confidence_score !== null) && (
                            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded">
                              {mention.sentiment_score !== null && (
                                <div>
                                  <p className="text-sm text-gray-600">Sentiment Score</p>
                                  <p className="font-semibold">{mention.sentiment_score.toFixed(2)}</p>
                                </div>
                              )}
                              {mention.confidence_score !== null && (
                                <div>
                                  <p className="text-sm text-gray-600">Confidence</p>
                                  <p className="font-semibold">{(mention.confidence_score * 100).toFixed(1)}%</p>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            {mention.url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={mention.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Source
                                </a>
                              </Button>
                            )}
                            {mention.sentiment === 'negative' && (
                              <Button 
                                size="sm" 
                                onClick={() => generateAIResponse(mention)}
                                className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
                              >
                                Generate Response
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Monitor New Terms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter brand name or keyword"
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addMonitoredTerm()}
                      />
                      <Button 
                        onClick={addMonitoredTerm} 
                        className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Term
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Monitored Terms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {monitoredTerms.length === 0 ? (
                        <p className="text-gray-500 text-sm">No terms being monitored</p>
                      ) : (
                        monitoredTerms.map((term) => (
                          <Badge key={term.id} variant="secondary" className="mr-2 mb-2">
                            {term.term}
                          </Badge>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {selectedMention && (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">AI Generated Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isGeneratingResponse ? (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">Generating response...</span>
                        </div>
                      ) : aiResponse ? (
                        <div className="space-y-4">
                          <Textarea 
                            value={aiResponse} 
                            onChange={(e) => setAiResponse(e.target.value)}
                            className="min-h-[120px]"
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-500">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              <ThumbsDown className="h-4 w-4 mr-2" />
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
          </TabsContent>

          <TabsContent value="trends">
            <GoogleTrendsChart />
          </TabsContent>

          <TabsContent value="priorities">
            <SitePriorityManager />
          </TabsContent>

          <TabsContent value="sentiment">
            <SentimentAnalyzer />
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <span>Reputation Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600">Comprehensive analytics and reporting will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reputation;
