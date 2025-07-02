
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, RefreshCw, X } from 'lucide-react';

type MonitoredTerm = {
  id: string;
  user_id: string;
  term: string;
  created_at: string;
  updated_at: string;
};

interface KeywordManagerProps {
  monitoredTerms: MonitoredTerm[];
  onKeywordAdded: () => void;
  onSearchBrandMentions: (keyword: string) => void;
}

const KeywordManager = ({ monitoredTerms, onKeywordAdded, onSearchBrandMentions }: KeywordManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newKeyword, setNewKeyword] = useState('');
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);

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
      onKeywordAdded();
      onSearchBrandMentions(newKeyword.trim());
      
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

  const removeKeyword = async (termId: string, termName: string) => {
    try {
      const { error } = await supabase
        .from('monitored_terms')
        .delete()
        .eq('id', termId);

      if (error) throw error;

      onKeywordAdded(); // Refresh the list
      
      toast({
        title: "Success",
        description: `Removed "${termName}" from monitoring`
      });
    } catch (error) {
      console.error('Error removing keyword:', error);
      toast({
        title: "Error",
        description: "Failed to remove keyword",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-6 w-6 text-blue-600" />
          <span>Add Brand Keywords</span>
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
          Keywords will be monitored across social media, news, forums, and review sites with real-time sentiment analysis
        </p>
        <div className="flex flex-wrap gap-2">
          {monitoredTerms.map((term) => (
            <Badge key={term.id} variant="secondary" className="px-3 py-1 flex items-center gap-2">
              <span>{term.term}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-red-100"
                onClick={() => removeKeyword(term.id, term.term)}
              >
                <X className="h-3 w-3 text-red-600" />
              </Button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordManager;
