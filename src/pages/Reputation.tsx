
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import KeywordManager from '@/components/reputation/KeywordManager';
import TrendsChart from '@/components/reputation/TrendsChart';
import BrandMentionsList from '@/components/reputation/BrandMentionsList';
import AIResponseEditor from '@/components/reputation/AIResponseEditor';

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
  url?: string;
};

const Reputation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentions, setMentions] = useState<BrandMention[]>([]);
  const [monitoredTerms, setMonitoredTerms] = useState<MonitoredTerm[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
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

      // Convert existing brand mentions to search results format for display
      const existingResults: SearchResult[] = mentionsResult.data?.map(mention => ({
        id: mention.id,
        keyword: mention.brand_name,
        title: `${mention.brand_name} mentioned on ${mention.platform}`,
        snippet: mention.mention_text.length > 100 
          ? `${mention.mention_text.substring(0, 100)}...` 
          : mention.mention_text,
        fullContent: mention.mention_text,
        source: mention.source_domain || mention.platform,
        sentiment: (mention.sentiment as 'positive' | 'negative' | 'neutral') || 'neutral',
        sentimentScore: mention.sentiment_score || 0,
        confidence: mention.confidence_score || 0,
        platform: mention.platform,
        publishedAt: new Date(mention.mentioned_at).toLocaleDateString(),
        url: mention.url || undefined,
        suggestedResponse: generateSuggestedResponse(mention.sentiment, mention.mention_text)
      })) || [];

      setSearchResults(existingResults);
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

  const searchBrandMentions = async (keyword: string) => {
    setIsSearching(true);
    try {
      // Fetch real brand mentions from the database
      const { data: brandMentions, error } = await supabase
        .from('brand_mentions')
        .select('*')
        .ilike('brand_name', `%${keyword}%`)
        .order('mentioned_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Convert database records to SearchResult format
      const realResults: SearchResult[] = brandMentions?.map(mention => ({
        id: mention.id,
        keyword,
        title: `${mention.brand_name} mentioned on ${mention.platform}`,
        snippet: mention.mention_text.length > 100 
          ? `${mention.mention_text.substring(0, 100)}...` 
          : mention.mention_text,
        fullContent: mention.mention_text,
        source: mention.source_domain || mention.platform,
        sentiment: (mention.sentiment as 'positive' | 'negative' | 'neutral') || 'neutral',
        sentimentScore: mention.sentiment_score || 0,
        confidence: mention.confidence_score || 0,
        platform: mention.platform,
        publishedAt: new Date(mention.mentioned_at).toLocaleDateString(),
        url: mention.url || undefined,
        suggestedResponse: generateSuggestedResponse(mention.sentiment, mention.mention_text)
      })) || [];
      
      setSearchResults(prev => [...prev.filter(r => r.keyword !== keyword), ...realResults]);
    } catch (error) {
      console.error('Error searching brand mentions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch brand mentions",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const generateSuggestedResponse = (sentiment: string | null, mentionText: string): string => {
    if (sentiment === 'positive') {
      return "Thank you so much for your wonderful feedback! We're thrilled to hear about your positive experience. Your support means the world to us and motivates us to continue delivering exceptional service.";
    } else if (sentiment === 'negative') {
      return "We sincerely apologize for your disappointing experience. This is not the level of service we strive for. Please reach out to our customer success team directly so we can make this right and address your concerns promptly.";
    } else {
      return "Thank you for taking the time to share your feedback. We appreciate all reviews as they help us improve. We'd love to learn more about your experience - please feel free to reach out with any suggestions.";
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
            <span>Brand Monitoring Dashboard</span>
          </h2>
          <p className="text-gray-600">Monitor your brand across all platforms with AI-powered sentiment analysis and automated response suggestions</p>
        </div>

        <div className="space-y-6">
          <KeywordManager 
            monitoredTerms={monitoredTerms}
            onKeywordAdded={fetchAllData}
            onSearchBrandMentions={searchBrandMentions}
          />

          <TrendsChart trendsData={trendsData} />

          <BrandMentionsList
            searchResults={searchResults}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onRefresh={fetchAllData}
            onGenerateAIResponse={generateAIResponse}
          />

          <AIResponseEditor
            selectedResult={selectedResult}
            aiResponse={aiResponse}
            isGenerating={isGeneratingResponse}
            onResponseChange={setAiResponse}
            onRegenerateResponse={generateAIResponse}
            onClose={() => setSelectedResult(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default Reputation;
