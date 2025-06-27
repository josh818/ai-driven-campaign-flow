
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Settings, Plus, Trash2, Globe } from 'lucide-react';

interface SitePriority {
  id: string;
  site_name: string;
  priority_score: number;
  is_active: boolean;
}

const SitePriorityManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sitePriorities, setSitePriorities] = useState<SitePriority[]>([]);
  const [newSite, setNewSite] = useState('');
  const [newPriority, setNewPriority] = useState([5]);

  useEffect(() => {
    if (user) {
      fetchSitePriorities();
    }
  }, [user]);

  const fetchSitePriorities = async () => {
    try {
      const { data, error } = await supabase
        .from('site_priorities')
        .select('*')
        .order('priority_score', { ascending: false });

      if (error) throw error;
      setSitePriorities(data || []);
    } catch (error) {
      console.error('Error fetching site priorities:', error);
    }
  };

  const addSite = async () => {
    if (!newSite.trim()) return;

    try {
      const { error } = await supabase
        .from('site_priorities')
        .insert([{
          site_name: newSite.trim().toLowerCase(),
          priority_score: newPriority[0],
          user_id: user?.id
        }]);

      if (error) throw error;

      setNewSite('');
      setNewPriority([5]);
      fetchSitePriorities();
      toast({
        title: "Success",
        description: "Site priority added successfully"
      });
    } catch (error) {
      console.error('Error adding site priority:', error);
      toast({
        title: "Error",
        description: "Failed to add site priority",
        variant: "destructive"
      });
    }
  };

  const updatePriority = async (id: string, newScore: number) => {
    try {
      const { error } = await supabase
        .from('site_priorities')
        .update({ priority_score: newScore, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchSitePriorities();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const deleteSite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('site_priorities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSitePriorities();
      toast({
        title: "Success",
        description: "Site priority removed"
      });
    } catch (error) {
      console.error('Error deleting site:', error);
      toast({
        title: "Error",
        description: "Failed to remove site priority",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800';
    if (score >= 6) return 'bg-orange-100 text-orange-800';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 8) return 'Critical';
    if (score >= 6) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-teal-600" />
          <span>Site Priority Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add new site */}
          <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-lg">
            <Input
              placeholder="Enter website domain (e.g., twitter.com)"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority Score: {newPriority[0]}</label>
              <Slider
                value={newPriority}
                onValueChange={setNewPriority}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low (1)</span>
                <span>Critical (10)</span>
              </div>
            </div>
            <Button 
              onClick={addSite}
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Site
            </Button>
          </div>

          {/* Site list */}
          <div className="space-y-3">
            {sitePriorities.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{site.site_name}</span>
                  <Badge className={getPriorityColor(site.priority_score)}>
                    {getPriorityLabel(site.priority_score)} ({site.priority_score})
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32">
                    <Slider
                      value={[site.priority_score]}
                      onValueChange={(value) => updatePriority(site.id, value[0])}
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSite(site.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SitePriorityManager;
