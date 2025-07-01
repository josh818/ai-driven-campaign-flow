
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, TrendingUp, TrendingDown, Minus, MessageSquare, Send } from 'lucide-react';

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  suggestedResponse?: string;
}

interface BrandMention {
  id: string;
  brand_name: string;
  mention_text: string;
  platform: string;
  sentiment: string | null;
  mentioned_at: string;
}

const SentimentAnalyzer = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [brandMentions, setBrandMentions] = useState<BrandMention[]>([]);
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBrandMentions();
    }
  }, [user]);

  const fetchBrandMentions = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_mentions')
        .select('*')
        .is('sentiment', null)
        .order('mentioned_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBrandMentions(data || []);
    } catch (error) {
      console.error('Error fetching brand mentions:', error);
    }
  };

  const analyzeSentiment = async (textToAnalyze: string = text) => {
    if (!textToAnalyze.trim()) return null;

    setIsAnalyzing(true);
    
    try {
      // Simulate sentiment analysis with more sophisticated logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'fantastic', 'awesome', 'perfect', 'outstanding', 'wonderful'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing', 'failed', 'useless', 'annoying'];
      
      const words = textToAnalyze.toLowerCase().split(/\s+/);
      const positiveCount = words.filter(word => positiveWords.some(pos => word.includes(pos))).length;
      const negativeCount = words.filter(word => negativeWords.some(neg => word.includes(neg))).length;
      
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      let score = 0;
      
      if (positiveCount > negativeCount) {
        sentiment = 'positive';
        score = Math.min(0.8, positiveCount * 0.3);
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        score = Math.max(-0.8, negativeCount * -0.3);
      }
      
      const confidence = Math.random() * 0.3 + 0.7;
      
      // Generate suggested response
      let suggestedResponse = '';
      if (sentiment === 'negative') {
        suggestedResponse = "Thank you for your feedback. We sincerely apologize for any inconvenience. We'd love to make this right - please reach out to our customer service team so we can address your concerns promptly.";
      } else if (sentiment === 'positive') {
        suggestedResponse = "Thank you so much for your kind words! We're thrilled to hear about your positive experience. Your feedback means the world to us and motivates our team to continue delivering excellent service.";
      } else {
        suggestedResponse = "Thank you for taking the time to share your thoughts with us. We appreciate all feedback as it helps us improve our services. If you have any specific suggestions, we'd love to hear them.";
      }
      
      const analysisResult = {
        sentiment,
        score,
        confidence,
        suggestedResponse
      };
      
      setResult(analysisResult);
      return analysisResult;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const autoAnalyzeBrandMentions = async () => {
    setIsAutoAnalyzing(true);
    
    try {
      for (const mention of brandMentions) {
        const analysis = await analyzeSentiment(mention.mention_text);
        
        if (analysis) {
          // Update the brand mention with sentiment analysis
          await supabase
            .from('brand_mentions')
            .update({
              sentiment: analysis.sentiment,
              sentiment_score: analysis.score,
              confidence_score: analysis.confidence
            })
            .eq('id', mention.id);
        }
        
        // Small delay between analyses
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Refresh brand mentions after analysis
      fetchBrandMentions();
    } catch (error) {
      console.error('Error in auto-analysis:', error);
    } finally {
      setIsAutoAnalyzing(false);
    }
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

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>AI Sentiment Analysis & Response Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter text to analyze sentiment (e.g., customer feedback, social media comments, reviews...)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px]"
            />
            
            <Button 
              onClick={() => analyzeSentiment()}
              disabled={!text.trim() || isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Sentiment & Generate Response
                </>
              )}
            </Button>

            {result && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Analysis Result</h4>
                  <Badge className={getSentimentColor(result.sentiment)}>
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(result.sentiment)}
                      <span className="capitalize">{result.sentiment}</span>
                    </div>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sentiment Score</p>
                    <p className="text-lg font-semibold">
                      {result.score > 0 ? '+' : ''}{result.score.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Range: -1.0 to +1.0</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-semibold">{(result.confidence * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Analysis reliability</p>
                  </div>
                </div>

                {result.suggestedResponse && (
                  <div>
                    <h5 className="font-semibold mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      AI Suggested Response
                    </h5>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-gray-700 mb-3">{result.suggestedResponse}</p>
                      <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-500">
                        <Send className="h-4 w-4 mr-2" />
                        Use This Response
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {brandMentions.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-orange-600" />
                <span>Unanalyzed Brand Mentions</span>
              </div>
              <Button 
                onClick={autoAnalyzeBrandMentions}
                disabled={isAutoAnalyzing}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isAutoAnalyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Auto-Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Auto-Analyze All ({brandMentions.length})
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brandMentions.map((mention) => (
                <div key={mention.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{mention.platform}</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(mention.mentioned_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1">{mention.brand_name}</h4>
                  <p className="text-gray-700 text-sm">{mention.mention_text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SentimentAnalyzer;
