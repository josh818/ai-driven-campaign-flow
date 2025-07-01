
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, RefreshCw } from 'lucide-react';

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
  url?: string;
};

interface AIResponseEditorProps {
  selectedResult: SearchResult | null;
  aiResponse: string;
  isGenerating: boolean;
  onResponseChange: (response: string) => void;
  onRegenerateResponse: (result: SearchResult) => void;
  onClose: () => void;
}

const AIResponseEditor = ({ 
  selectedResult, 
  aiResponse, 
  isGenerating, 
  onResponseChange, 
  onRegenerateResponse, 
  onClose 
}: AIResponseEditorProps) => {
  if (!selectedResult) return null;

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
          <span>Customize AI Response</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex items-center space-x-3 py-8 justify-center">
            <Brain className="h-8 w-8 animate-pulse text-purple-500" />
            <span className="text-gray-600">Generating personalized response...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Responding to:</p>
              <p className="font-medium text-gray-900 mb-2">{selectedResult.title}</p>
              <Badge className={getSentimentColor(selectedResult.sentiment)}>
                {selectedResult.sentiment}
              </Badge>
            </div>
            <Textarea 
              value={aiResponse} 
              onChange={(e) => onResponseChange(e.target.value)}
              className="min-h-[120px] resize-none"
              placeholder="AI-generated response will appear here..."
            />
            <div className="flex space-x-2">
              <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                <Send className="h-4 w-4 mr-2" />
                Send Response
              </Button>
              <Button variant="outline" onClick={() => onRegenerateResponse(selectedResult)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIResponseEditor;
