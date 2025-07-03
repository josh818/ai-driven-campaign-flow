
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Filter,
  Star,
  Target,
  ShoppingBag
} from 'lucide-react';

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
  relevanceScore?: 'high' | 'medium' | 'low';
  mentionCategory?: string;
  engagementPotential?: number;
  competitorMention?: boolean;
};

interface BrandMentionsListProps {
  searchResults: SearchResult[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onRefresh: () => void;
  onGenerateAIResponse: (result: SearchResult) => void;
}

const BrandMentionsList = ({ 
  searchResults, 
  searchTerm, 
  onSearchTermChange, 
  onRefresh,
  onGenerateAIResponse 
}: BrandMentionsListProps) => {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

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

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'buy-intent': return <ShoppingBag className="h-3 w-3" />;
      case 'testimonial': return <Star className="h-3 w-3" />;
      case 'competitive': return <Target className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
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

  const filteredResults = searchResults.filter(result => {
    const matchesSearch = result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSentiment = sentimentFilter === 'all' || result.sentiment === sentimentFilter;
    const matchesRelevance = relevanceFilter === 'all' || result.relevanceScore === relevanceFilter;
    const matchesPlatform = platformFilter === 'all' || result.platform.toLowerCase().includes(platformFilter.toLowerCase());
    
    return matchesSearch && matchesSentiment && matchesRelevance && matchesPlatform;
  });

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-orange-600" />
          <span>AI-Filtered Brand Mentions</span>
        </CardTitle>
        <div className="space-y-4 mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search mentions and content..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={onRefresh} className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Relevance</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitter">X/Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentions match your filters</h3>
            <p className="text-gray-600">Try adjusting your search criteria or add more keywords to monitor</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Showing {filteredResults.length} of {searchResults.length} mentions</span>
              <div className="flex items-center space-x-4">
                <span className="text-red-600">● High relevance: {filteredResults.filter(r => r.relevanceScore === 'high').length}</span>
                <span className="text-yellow-600">● Medium relevance: {filteredResults.filter(r => r.relevanceScore === 'medium').length}</span>
                <span className="text-gray-600">● Low relevance: {filteredResults.filter(r => r.relevanceScore === 'low').length}</span>
              </div>
            </div>
            
            {filteredResults.map((result) => (
              <div key={result.id} className="p-6 border rounded-lg hover:bg-gray-50 transition-colors bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="secondary" className="text-xs">{result.keyword}</Badge>
                      <Badge variant="outline" className="text-xs">{result.platform}</Badge>
                      
                      {result.relevanceScore && (
                        <Badge className={`${getRelevanceColor(result.relevanceScore)} text-xs`}>
                          <div className="flex items-center space-x-1">
                            <span className="capitalize">{result.relevanceScore} Relevance</span>
                          </div>
                        </Badge>
                      )}
                      
                      <Badge className={`${getSentimentColor(result.sentiment)} text-xs`}>
                        <div className="flex items-center space-x-1">
                          {getSentimentIcon(result.sentiment)}
                          <span className="capitalize">{result.sentiment}</span>
                          <span className="text-xs">({(result.confidence * 100).toFixed(0)}%)</span>
                        </div>
                      </Badge>
                      
                      {result.mentionCategory && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(result.mentionCategory)}
                            <span className="capitalize">{result.mentionCategory}</span>
                          </div>
                        </Badge>
                      )}
                      
                      {result.competitorMention && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Competitor
                        </Badge>
                      )}
                      
                      {result.sentiment === 'negative' && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Needs Response
                        </Badge>
                      )}
                      
                      {result.relevanceScore === 'high' && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          High Impact
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{result.title}</h3>
                  </div>
                  <div className="text-right text-sm text-gray-500 ml-4">
                    <p className="font-medium">{result.publishedAt}</p>
                    <p className="text-xs">Score: {result.sentimentScore > 0 ? '+' : ''}{result.sentimentScore.toFixed(2)}</p>
                    {result.engagementPotential && (
                      <p className="text-xs">Engagement: {result.engagementPotential}/10</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {expandedResults.has(result.id) ? result.fullContent : result.snippet}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => toggleExpanded(result.id)}
                    >
                      {expandedResults.has(result.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Read More
                        </>
                      )}
                    </Button>
                    {result.url && (
                      <Button 
                        variant="outline" 
                        className="text-xs"
                        asChild
                      >
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Source
                        </a>
                      </Button>
                    )}
                  </div>
                  <Button 
                    onClick={() => onGenerateAIResponse(result)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-xs"
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    AI Response
                  </Button>
                </div>

                {result.suggestedResponse && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <h5 className="font-semibold text-sm mb-2 flex items-center text-blue-800">
                      <Brain className="h-4 w-4 mr-2" />
                      AI-Suggested Response
                    </h5>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{result.suggestedResponse}</p>
                    <div className="flex space-x-2">
                      <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-xs">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Send Response
                      </Button>
                      <Button variant="outline" className="text-xs" onClick={() => onGenerateAIResponse(result)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrandMentionsList;
