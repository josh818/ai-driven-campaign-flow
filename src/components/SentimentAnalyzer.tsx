
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

const SentimentAnalyzer = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSentiment = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate sentiment analysis (in a real app, this would call an AI service)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock sentiment analysis results
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'fantastic', 'awesome', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing', 'failed'];
    
    const words = text.toLowerCase().split(/\s+/);
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
    
    const confidence = Math.random() * 0.3 + 0.7; // Mock confidence between 0.7-1.0
    
    setResult({
      sentiment,
      score,
      confidence
    });
    
    setIsAnalyzing(false);
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
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span>Sentiment Analysis Tool</span>
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
            onClick={analyzeSentiment}
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
                Analyze Sentiment
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentAnalyzer;
