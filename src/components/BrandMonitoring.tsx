
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type BrandMention = Database['public']['Tables']['brand_mentions']['Row'];

const BrandMonitoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentions, setMentions] = useState<BrandMention[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
        .order('mentioned_at', { ascending: false });

      if (error) throw error;
      setMentions(data || []);
    } catch (error) {
      console.error('Error fetching brand mentions:', error);
      toast({
        title: "Error",
        description: "Failed to load brand mentions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <Button onClick={fetchBrandMentions}>
          Refresh
        </Button>
      </div>

      {filteredMentions.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center py-16">
          <CardContent>
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
                {mention.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={mention.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Source
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandMonitoring;
