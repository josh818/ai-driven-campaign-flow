import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Webhook, MessageSquare, Mail } from 'lucide-react';

interface NotificationSettingsProps {
  onSettingsChange: () => void;
}

const NotificationSettings = ({ onSettingsChange }: NotificationSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    slackWebhook: '',
    webhookUrl: '',
    relevanceFilter: 'medium', // high, medium, low
    realTimeAlerts: true
  });

  const handleSettingChange = async (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Here you would save to user preferences or settings table
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved."
    });
    onSettingsChange();
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-purple-600" />
          <span>Notification Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-gray-600">Receive alerts via email for new mentions</p>
          </div>
          <Switch
            id="email-notifications"
            checked={settings.emailNotifications}
            onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="real-time">Real-time Alerts</Label>
            <p className="text-sm text-gray-600">Get instant notifications for high-relevance mentions</p>
          </div>
          <Switch
            id="real-time"
            checked={settings.realTimeAlerts}
            onCheckedChange={(value) => handleSettingChange('realTimeAlerts', value)}
          />
        </div>

        <div className="space-y-3">
          <Label>Relevance Filter</Label>
          <div className="flex space-x-2">
            {['high', 'medium', 'low'].map((level) => (
              <Button
                key={level}
                variant={settings.relevanceFilter === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSettingChange('relevanceFilter', level)}
                className="capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
          <p className="text-sm text-gray-600">Only receive notifications for mentions above this relevance threshold</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
          <div className="flex space-x-2">
            <MessageSquare className="h-4 w-4 text-gray-400 mt-3" />
            <Input
              id="slack-webhook"
              placeholder="https://hooks.slack.com/services/..."
              value={settings.slackWebhook}
              onChange={(e) => handleSettingChange('slackWebhook', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="webhook-url">Custom Webhook URL</Label>
          <div className="flex space-x-2">
            <Webhook className="h-4 w-4 text-gray-400 mt-3" />
            <Input
              id="webhook-url"
              placeholder="https://your-app.com/webhook"
              value={settings.webhookUrl}
              onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;