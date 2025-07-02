
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Image, 
  Video, 
  Mail, 
  Share2, 
  DollarSign,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Eye
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type GeneratedContent = Database['public']['Tables']['campaign_generated_content']['Row'];

interface CampaignContentViewerProps {
  campaignId: string;
}

const CampaignContentViewer = ({ campaignId }: CampaignContentViewerProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [campaignId]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_generated_content')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'twitter': case 'x': return <Twitter className="h-4 w-4" />;
      case 'mailchimp': case 'klaviyo': return <Mail className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'copy': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'organic_post': return 'bg-green-100 text-green-800';
      case 'paid_ad': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePushLive = async (item: GeneratedContent) => {
    try {
      // Here you would integrate with your social media APIs
      // For now, we'll show a placeholder implementation
      toast({
        title: "Publishing Content",
        description: `Publishing ${item.media_type} content to ${item.platform}...`,
      });

      // Example: This is where you'd call your social media APIs
      // await publishToSocialMedia(item.platform, item.content_text, item.media_url);
      
      // For now, we'll simulate success
      setTimeout(() => {
        toast({
          title: "Content Published!",
          description: `Successfully published to ${item.platform}`,
        });
      }, 2000);

    } catch (error) {
      console.error('Error publishing content:', error);
      toast({
        title: "Publishing Failed",
        description: "Failed to publish content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const groupedContent = content.reduce((acc, item) => {
    const key = `${item.content_type}_${item.platform}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, GeneratedContent[]>);

  const organicContent = content.filter(item => item.content_type === 'organic_post');
  const paidAdContent = content.filter(item => item.content_type === 'paid_ad');
  const emailContent = content.filter(item => item.content_type === 'email');

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const ContentCard = ({ items, title, icon }: { items: GeneratedContent[], title: string, icon: React.ReactNode }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary">{items.length} items</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPlatformIcon(item.platform)}
                  <span className="text-sm font-medium capitalize">{item.platform}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getMediaIcon(item.media_type)}
                  <Badge className={getContentTypeColor(item.content_type)}>
                    {item.content_type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 line-clamp-3">
                  {item.content_text}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Content
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        {getPlatformIcon(item.platform)}
                        <span>{item.platform} - {item.media_type}</span>
                        <Badge className={getContentTypeColor(item.content_type)}>
                          {item.content_type.replace('_', ' ')}
                        </Badge>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {item.content_type === 'email' ? (
                        <div className="bg-white border rounded-lg p-4 space-y-3">
                          <div className="border-b pb-2">
                            <div className="text-sm text-gray-500">Subject:</div>
                            <div className="font-medium">{item.content_text?.split('\n')[0] || 'Email Subject'}</div>
                          </div>
                          <div className="whitespace-pre-wrap text-sm">
                            {item.content_text?.split('\n').slice(1).join('\n') || item.content_text}
                          </div>
                        </div>
                      ) : (
                        <div className={`${item.platform === 'linkedin' ? 'bg-blue-50' : item.platform === 'instagram' ? 'bg-pink-50' : item.platform === 'facebook' ? 'bg-blue-50' : 'bg-gray-50'} border rounded-lg p-4`}>
                          <div className="whitespace-pre-wrap text-sm">
                            {item.content_text}
                          </div>
                        </div>
                      )}
                      {item.generated_prompt && (
                        <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                          <strong>Generated from prompt:</strong> {item.generated_prompt}
                        </div>
                      )}
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button 
                          onClick={() => handlePushLive(item)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Push Live to {item.platform}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  onClick={() => handlePushLive(item)}
                  variant="default"
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Push Live
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Generated Content</h2>
        <Badge variant="outline">{content.length} total pieces</Badge>
      </div>

      <Tabs defaultValue="organic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organic">
            <Share2 className="h-4 w-4 mr-2" />
            Organic Posts ({organicContent.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            <DollarSign className="h-4 w-4 mr-2" />
            Paid Ads ({paidAdContent.length})
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email ({emailContent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organic">
          <ContentCard 
            items={organicContent} 
            title="Organic Social Media Posts" 
            icon={<Share2 className="h-5 w-5 text-green-600" />}
          />
        </TabsContent>

        <TabsContent value="paid">
          <ContentCard 
            items={paidAdContent} 
            title="Paid Advertisement Content" 
            icon={<DollarSign className="h-5 w-5 text-blue-600" />}
          />
        </TabsContent>

        <TabsContent value="email">
          <ContentCard 
            items={emailContent} 
            title="Email Marketing Content" 
            icon={<Mail className="h-5 w-5 text-purple-600" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignContentViewer;
