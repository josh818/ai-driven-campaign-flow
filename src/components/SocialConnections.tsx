
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Instagram, Linkedin, Twitter, Mail, MousePointer } from 'lucide-react';

interface SocialConnection {
  id: string;
  platform: string;
  is_connected: boolean;
  account_name?: string;
  connected_at?: string;
}

const PLATFORMS = [
  { name: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { name: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-600' },
  { name: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-800' },
  { name: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'bg-black' },
  { name: 'mailchimp', label: 'Mailchimp', icon: Mail, color: 'bg-yellow-600' },
  { name: 'klaviyo', label: 'Klaviyo', icon: MousePointer, color: 'bg-purple-600' },
];

const SocialConnections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .order('platform');

      if (error) throw error;

      // Merge existing connections with all platforms
      const connectionMap = new Map(data?.map(conn => [conn.platform, conn]) || []);
      const allConnections = PLATFORMS.map(platform => 
        connectionMap.get(platform.name) || {
          id: '',
          platform: platform.name,
          is_connected: false
        }
      );

      setConnections(allConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load social connections.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleConnection = async (platform: string, isConnected: boolean) => {
    try {
      if (isConnected) {
        // Simulate connection process (in real app, this would redirect to OAuth)
        const { error } = await supabase
          .from('social_connections')
          .upsert({
            user_id: user!.id,
            platform,
            is_connected: true,
            account_name: `${platform}_account`,
            connected_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Connected",
          description: `Successfully connected to ${platform}.`,
        });
      } else {
        // Disconnect
        const { error } = await supabase
          .from('social_connections')
          .update({ 
            is_connected: false,
            access_token: null,
            refresh_token: null,
            connected_at: null
          })
          .eq('user_id', user!.id)
          .eq('platform', platform);

        if (error) throw error;

        toast({
          title: "Disconnected",
          description: `Disconnected from ${platform}.`,
        });
      }

      fetchConnections();
    } catch (error: any) {
      console.error('Error toggling connection:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getPlatformInfo = (platform: string) => {
    return PLATFORMS.find(p => p.name === platform) || PLATFORMS[0];
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Social Media Connections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connections.map((connection) => {
          const platformInfo = getPlatformInfo(connection.platform);
          const Icon = platformInfo.icon;
          
          return (
            <div key={connection.platform} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${platformInfo.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">{platformInfo.label}</h3>
                  {connection.is_connected && connection.account_name && (
                    <p className="text-sm text-gray-600">@{connection.account_name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {connection.is_connected ? (
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                ) : (
                  <Badge variant="secondary">Not Connected</Badge>
                )}
                <Switch
                  checked={connection.is_connected}
                  onCheckedChange={(checked) => toggleConnection(connection.platform, checked)}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SocialConnections;
