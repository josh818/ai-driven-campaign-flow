
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Eye,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type GeneratedContent = Database['public']['Tables']['campaign_generated_content']['Row'];

const ContentPreviews = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentContent();
    }
  }, [user]);

  const fetchRecentContent = async () => {
    try {
      // Fetch recent content from campaigns owned by the user
      const { data, error } = await supabase
        .from('campaign_generated_content')
        .select(`
          *,
          campaigns!inner(user_id)
        `)
        .eq('campaigns.user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(9); // 3 per category

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
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

  const organicContent = content.filter(item => item.content_type === 'organic_post').slice(0, 3);
  const paidAdContent = content.filter(item => item.content_type === 'paid_ad').slice(0, 3);
  const emailContent = content.filter(item => item.content_type === 'email').slice(0, 3);

  const ContentSection = ({ 
    title, 
    items, 
    icon, 
    emptyMessage 
  }: { 
    title: string; 
    items: GeneratedContent[]; 
    icon: React.ReactNode;
    emptyMessage: string;
  }) => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center space-x-2">
          {icon}
          <span>{title}</span>
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">{icon}</div>
            <p className="text-sm">{emptyMessage}</p>
            <Link to="/create-campaign">
              <Button variant="outline" size="sm" className="mt-3">
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(item.platform)}
                    <span className="text-sm font-medium capitalize">{item.platform}</span>
                    {getMediaIcon(item.media_type)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.media_type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.content_text}
                </p>
              </div>
            ))}
            {items.length > 0 && (
              <Link to="/campaigns">
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Recent AI Content</h3>
        <Link to="/create-campaign">
          <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
            <Plus className="h-4 w-4 mr-2" />
            Generate New Content
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ContentSection
          title="Organic Posts"
          items={organicContent}
          icon={<Share2 className="h-5 w-5 text-green-600" />}
          emptyMessage="No organic posts yet. Create your first campaign to generate social media content."
        />
        
        <ContentSection
          title="Paid Ads"
          items={paidAdContent}
          icon={<DollarSign className="h-5 w-5 text-blue-600" />}
          emptyMessage="No paid ads yet. Generate advertisement content with AI to boost your campaigns."
        />
        
        <ContentSection
          title="Email Content"
          items={emailContent}
          icon={<Mail className="h-5 w-5 text-purple-600" />}
          emptyMessage="No email content yet. Create email campaigns to engage with your audience."
        />
      </div>
    </div>
  );
};

export default ContentPreviews;
