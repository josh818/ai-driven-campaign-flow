
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
  ThumbsDown
} from 'lucide-react';
import Header from '@/components/Header';
import { Database } from '@/integrations/supabase/types';

type BrandMention = Database['public']['Tables']['brand_mentions']['Row'];
type MonitoredTerm = Database['public']['Tables']['monitored_terms']['Row'];

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

  const generateAIResponse = async (mention: BrandMention) => {
    setIsGeneratingResponse(true);
    setSelectedMention(mention);
    
    try {
      // Simulate AI response generation
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
          <p className="text-gray-600">Monitor your brand mentions and manage your online reputation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
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

            {/* Mentions List */}
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
                    </CardHeader>
                    <CardContent>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add Monitored Terms */}
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

            {/* Current Monitored Terms */}
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

            {/* AI Response Generator */}
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
      </div>
    </div>
  );
};

export default Reputation;
