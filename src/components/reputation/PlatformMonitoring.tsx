import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Globe, Eye, EyeOff, Plus, X } from 'lucide-react';

interface PlatformCoverage {
  id: string;
  platform_name: string;
  is_enabled: boolean;
  last_scan_at: string | null;
}

interface PlatformMonitoringProps {
  onPlatformToggle: () => void;
}

const PlatformMonitoring = ({ onPlatformToggle }: PlatformMonitoringProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<PlatformCoverage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPlatforms();
    }
  }, [user]);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_coverage')
        .select('*')
        .order('platform_name');

      if (error) throw error;

      setPlatforms(data || []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      toast({
        title: "Error",
        description: "Failed to load platform settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlatform = async (platformId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('platform_coverage')
        .update({ is_enabled: enabled })
        .eq('id', platformId);

      if (error) throw error;

      setPlatforms(prev => 
        prev.map(p => p.id === platformId ? { ...p, is_enabled: enabled } : p)
      );

      onPlatformToggle();
      
      toast({
        title: "Platform Updated",
        description: `Platform monitoring ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.error('Error updating platform:', error);
      toast({
        title: "Error",
        description: "Failed to update platform settings",
        variant: "destructive"
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const iconMap: { [key: string]: string } = {
      'X/Twitter': '𝕏',
      'LinkedIn': 'in',
      'Reddit': 'R',
      'GitHub': '🐙',
      'YouTube': '▶️',
      'Hacker News': 'Y',
      'Stack Overflow': 'SO',
      'DEV.to': 'DEV'
    };
    return iconMap[platform] || '🌐';
  };

  const getStatusColor = (platform: PlatformCoverage) => {
    if (!platform.is_enabled) return 'bg-gray-100 text-gray-600';
    return platform.last_scan_at ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-blue-600" />
            <span>Platform Coverage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-blue-600" />
          <span>Platform Coverage</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Monitor mentions across {platforms.filter(p => p.is_enabled).length} of {platforms.length} platforms
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getPlatformIcon(platform.platform_name)}</div>
                <div>
                  <h3 className="font-medium">{platform.platform_name}</h3>
                  <Badge className={`${getStatusColor(platform)} text-xs`}>
                    {platform.is_enabled 
                      ? (platform.last_scan_at ? 'Active' : 'Monitoring') 
                      : 'Disabled'
                    }
                  </Badge>
                </div>
              </div>
              <Switch
                checked={platform.is_enabled}
                onCheckedChange={(enabled) => togglePlatform(platform.id, enabled)}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-semibold text-blue-800 mb-2">Coverage Statistics</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Active Platforms:</span>
              <div className="font-semibold">{platforms.filter(p => p.is_enabled).length}</div>
            </div>
            <div>
              <span className="text-blue-600">Last 24h Scans:</span>
              <div className="font-semibold">{platforms.filter(p => p.last_scan_at).length}</div>
            </div>
            <div>
              <span className="text-blue-600">Coverage:</span>
              <div className="font-semibold">
                {Math.round((platforms.filter(p => p.is_enabled).length / platforms.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformMonitoring;