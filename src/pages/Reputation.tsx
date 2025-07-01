
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
          url: `https://twitter.com/search?q=${encodeURIComponent(keyword)}`,
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
          url: `https://reddit.com/search?q=${encodeURIComponent(keyword)}`,
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
          url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}+reviews`,
          suggestedResponse: "Thank you for taking the time to share your honest feedback. We appreciate all reviews as they help us improve. We'd love to learn more about the advanced features you were looking for - please feel free to reach out with suggestions."
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
