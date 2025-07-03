import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, X, Search } from 'lucide-react';

interface CompetitorKeyword {
  id: string;
  competitor_name: string;
  keywords: string[];
  is_active: boolean;
}

interface CompetitorMonitoringProps {
  onCompetitorAdded: () => void;
}

const CompetitorMonitoring = ({ onCompetitorAdded }: CompetitorMonitoringProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [competitors, setCompetitors] = useState<CompetitorKeyword[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompetitors();
    }
  }, [user]);

  const fetchCompetitors = async () => {
    try {
      const { data, error } = await supabase
        .from('competitor_keywords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompetitors(data || []);
    } catch (error) {
      console.error('Error fetching competitors:', error);
      toast({
        title: "Error",
        description: "Failed to load competitor data",
        variant: "destructive"
      });
    }
  };

  const addCompetitor = async () => {
    if (!newCompetitor.trim() || !newKeywords.trim()) return;

    setIsAdding(true);
    try {
      const keywords = newKeywords.split(',').map(k => k.trim()).filter(k => k);
      
      const { error } = await supabase
        .from('competitor_keywords')
        .insert([{
          competitor_name: newCompetitor.trim(),
          keywords: keywords,
          user_id: user?.id
        }]);

      if (error) throw error;

      setNewCompetitor('');
      setNewKeywords('');
      setShowAddForm(false);
      fetchCompetitors();
      onCompetitorAdded();

      toast({
        title: "Competitor Added",
        description: `Now monitoring ${newCompetitor} with ${keywords.length} keywords`
      });
    } catch (error) {
      console.error('Error adding competitor:', error);
      toast({
        title: "Error",
        description: "Failed to add competitor",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removeCompetitor = async (competitorId: string, competitorName: string) => {
    try {
      const { error } = await supabase
        .from('competitor_keywords')
        .delete()
        .eq('id', competitorId);

      if (error) throw error;

      setCompetitors(prev => prev.filter(c => c.id !== competitorId));
      onCompetitorAdded();

      toast({
        title: "Competitor Removed",
        description: `Stopped monitoring ${competitorName}`
      });
    } catch (error) {
      console.error('Error removing competitor:', error);
      toast({
        title: "Error",
        description: "Failed to remove competitor",
        variant: "destructive"
      });
    }
  };

  const toggleCompetitor = async (competitorId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('competitor_keywords')
        .update({ is_active: isActive })
        .eq('id', competitorId);

      if (error) throw error;

      setCompetitors(prev => 
        prev.map(c => c.id === competitorId ? { ...c, is_active: isActive } : c)
      );

      toast({
        title: "Competitor Updated",
        description: `Monitoring ${isActive ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.error('Error updating competitor:', error);
      toast({
        title: "Error",
        description: "Failed to update competitor",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-red-600" />
            <span>Competitor Monitoring</span>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Track {competitors.filter(c => c.is_active).length} competitors across social platforms
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-4">
            <Input
              placeholder="Competitor name (e.g., Slack, Microsoft Teams)"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
            />
            <Input
              placeholder="Keywords to monitor (comma-separated)"
              value={newKeywords}
              onChange={(e) => setNewKeywords(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button 
                onClick={addCompetitor}
                disabled={isAdding}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              >
                {isAdding ? 'Adding...' : 'Add Competitor'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {competitors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No competitors tracked</h3>
            <p className="text-gray-600">Start monitoring your competitors to stay ahead</p>
          </div>
        ) : (
          <div className="space-y-4">
            {competitors.map((competitor) => (
              <div 
                key={competitor.id} 
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-lg">{competitor.competitor_name}</h3>
                    <Badge 
                      className={competitor.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    >
                      {competitor.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCompetitor(competitor.id, !competitor.is_active)}
                    >
                      {competitor.is_active ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCompetitor(competitor.id, competitor.competitor_name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {competitor.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  <span className="font-medium">{competitor.keywords.length}</span> keywords monitored
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompetitorMonitoring;