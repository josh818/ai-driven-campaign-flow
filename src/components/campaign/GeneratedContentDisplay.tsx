
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Copy, Download, Image, Video, FileText, Sparkles, Play, Mail, 
  Facebook, Instagram, Twitter, Linkedin, Edit3, Calendar, 
  Share, Heart, MessageCircle, BarChart3, Send, Eye, Settings,
  Palette, Type, Clock, Users, Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface GeneratedContent {
  type: 'copy' | 'image' | 'video' | 'email';
  content: string;
  platform?: string;
  mediaUrl?: string;
  contentType?: string;
  mediaType?: string;
}

interface GeneratedContentDisplayProps {
  content: GeneratedContent[];
}

interface ContentEditState {
  isEditing: boolean;
  editedContent: string;
  selectedTemplate: string;
  scheduledTime: string;
  additionalSettings: {
    autoHashtags: boolean;
    audienceTargeting: boolean;
    crossPosting: boolean;
  };
}

const GeneratedContentDisplay = ({ content }: GeneratedContentDisplayProps) => {
  const { toast } = useToast();
  const [editStates, setEditStates] = useState<{ [key: number]: ContentEditState }>({});
  const [activeTab, setActiveTab] = useState('preview');

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content copied to clipboard!",
    });
  };

  const downloadMedia = (mediaUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded",
      description: "Media file downloaded successfully!",
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'copy': return <FileText className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'email': return <Mail className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (content.length === 0) return null;

  // Group and combine content by platform for integrated posts
  const platformGroups = content.reduce((groups, item) => {
    const platform = item.platform || 'general';
    
    if (platform === 'email') {
      if (!groups.email) groups.email = [];
      groups.email.push(item);
    } else if (['facebook', 'instagram', 'twitter', 'linkedin'].includes(platform)) {
      if (!groups.social) groups.social = {};
      if (!groups.social[platform]) groups.social[platform] = [];
      groups.social[platform].push(item);
    }
    
    return groups;
  }, {} as any);

  // Create integrated posts for each social platform
  const organicSocialPosts = [];
  if (platformGroups.social) {
    Object.entries(platformGroups.social).forEach(([platform, items]: [string, any[]]) => {
      const copyItem = items.find(item => item.mediaType === 'text' || item.type === 'copy');
      const imageItems = items.filter(item => item.mediaType === 'image' || item.type === 'image');
      const videoItems = items.filter(item => item.mediaType === 'video' || item.type === 'video');
      
      // Create post with copy + image
      if (copyItem && imageItems.length > 0) {
        organicSocialPosts.push({
          ...copyItem,
          mediaUrl: imageItems[0].mediaUrl,
          mediaType: 'image'
        });
      }
      
      // Create post with copy + video  
      if (copyItem && videoItems.length > 0) {
        organicSocialPosts.push({
          ...copyItem,
          mediaUrl: videoItems[0].mediaUrl,
          mediaType: 'video'
        });
      }
      
      // If only copy exists, add it anyway
      if (copyItem && imageItems.length === 0 && videoItems.length === 0) {
        organicSocialPosts.push(copyItem);
      }
    });
  }
  
  const emailContent = platformGroups.email || [];

  const renderSocialMediaPost = (item: GeneratedContent, index: number) => {
    const platform = item.platform?.toLowerCase();
    
    // Platform-specific styling
    const getPostStyle = () => {
      switch (platform) {
        case 'instagram':
          return {
            container: "bg-white border border-gray-200 rounded-lg max-w-sm mx-auto",
            header: "flex items-center p-3 border-b border-gray-100",
            avatar: "w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold",
            username: "ml-2 font-medium text-sm",
            image: "w-full aspect-square object-cover",
            content: "p-3 text-sm leading-relaxed",
            actions: "flex justify-between items-center px-3 pb-3"
          };
        case 'linkedin':
          return {
            container: "bg-white border border-gray-300 rounded-lg max-w-lg",
            header: "flex items-center p-4 border-b border-gray-100",
            avatar: "w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold",
            username: "ml-3 font-medium text-base",
            image: "w-full max-h-80 object-cover",
            content: "p-4 text-sm leading-relaxed text-gray-800",
            actions: "flex justify-between items-center px-4 pb-4 text-blue-600"
          };
        case 'facebook':
          return {
            container: "bg-white border border-gray-300 rounded-lg max-w-lg",
            header: "flex items-center p-3",
            avatar: "w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold",
            username: "ml-2 font-medium text-base",
            image: "w-full max-h-80 object-cover",
            content: "p-3 text-sm leading-relaxed",
            actions: "flex justify-between items-center px-3 pb-3 text-gray-600"
          };
        case 'twitter':
          return {
            container: "bg-white border border-gray-200 rounded-xl max-w-lg p-3",
            header: "flex items-center mb-2",
            avatar: "w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold",
            username: "ml-2 font-bold text-sm",
            image: "w-full max-h-60 object-cover rounded-xl mt-2",
            content: "text-sm leading-relaxed",
            actions: "flex justify-between items-center mt-3 text-gray-500"
          };
        default:
          return {
            container: "bg-white border border-gray-200 rounded-lg max-w-lg",
            header: "flex items-center p-3 border-b border-gray-100",
            avatar: "w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-bold",
            username: "ml-2 font-medium text-base",
            image: "w-full max-h-80 object-cover",
            content: "p-3 text-sm leading-relaxed",
            actions: "flex justify-between items-center px-3 pb-3"
          };
      }
    };

    const style = getPostStyle();
    const brandInitials = item.content?.match(/Brand: ([A-Z])/)?.[1] || 'B';

    return (
      <Card key={index} className="border-0 shadow-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getPlatformIcon(item.platform || '')}
            <span className="capitalize text-sm font-medium">
              {item.platform || 'Social'} Post Preview
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(item.content)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            {item.mediaUrl && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => downloadMedia(item.mediaUrl!, `${item.type}-${Date.now()}.${item.type === 'video' ? 'mp4' : 'png'}`)}
              >
                <Download className="h-4 w-4 mr-1" />
                Media
              </Button>
            )}
          </div>
        </div>
        
        {/* Social Media Post Mockup */}
        <div className={style.container}>
          {/* Header */}
          <div className={style.header}>
            <div className={style.avatar}>
              {brandInitials}
            </div>
            <div className={style.username}>
              {item.content?.match(/Brand: ([^,\n]+)/)?.[1] || 'Brand Name'}
              {platform === 'twitter' && <span className="text-gray-500 ml-1">@brand</span>}
              {platform === 'linkedin' && <div className="text-xs text-gray-500">Company • 1st</div>}
            </div>
          </div>
          
          {/* Content */}
          <div className={style.content}>
            <div className="whitespace-pre-wrap">
              {item.content?.replace(/^(Brand:|Campaign:|CAMPAIGN:).*\n/gm, '')}
            </div>
          </div>
          
          {/* Media */}
          {item.mediaUrl && (
            <div className="px-0">
              {item.mediaType === 'video' ? (
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video 
                    controls 
                    className={style.image}
                    poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFJIFZpZGVvPC90ZXh0Pgo8L3N2Zz4="
                  >
                    <source src={item.mediaUrl} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="h-12 w-12 text-white opacity-70" />
                  </div>
                </div>
              ) : (
                <img 
                  src={item.mediaUrl} 
                  alt="Generated content"
                  className={style.image}
                />
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className={style.actions}>
            <div className="flex space-x-4 text-sm">
              {platform === 'instagram' && (
                <>
                  <span>❤️ Like</span>
                  <span>💬 Comment</span>
                  <span>📤 Share</span>
                </>
              )}
              {platform === 'linkedin' && (
                <>
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>🔄 Repost</span>
                  <span>📤 Send</span>
                </>
              )}
              {platform === 'facebook' && (
                <>
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>📤 Share</span>
                </>
              )}
              {platform === 'twitter' && (
                <>
                  <span>💬 Reply</span>
                  <span>🔄 Retweet</span>
                  <span>❤️ Like</span>
                  <span>📤 Share</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderEmailPost = (item: GeneratedContent, index: number) => (
    <Card key={index} className="border-0 shadow-lg bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Email Preview</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(item.content)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Email
        </Button>
      </div>
      
      {/* Email Mockup */}
      <div className="bg-white rounded-lg border border-gray-200 max-w-2xl">
        {/* Email Header */}
        <div className="border-b border-gray-200 p-4 bg-gray-50 rounded-t-lg">
          <div className="text-sm text-gray-600 mb-1">From: {item.content?.match(/Brand: ([^,\n]+)/)?.[1] || 'Brand'} &lt;hello@brand.com&gt;</div>
          <div className="text-sm text-gray-600 mb-1">To: customer@email.com</div>
          <div className="font-medium text-gray-800">
            Subject: {item.content?.split('\n')[0]?.replace('Subject: ', '') || 'Campaign Update'}
          </div>
        </div>
        
        {/* Email Body */}
        <div className="p-6" style={{fontFamily: 'Arial, sans-serif'}}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {item.content?.split('\n').slice(1).join('\n') || item.content}
          </div>
          
          {/* Email Image Placeholder */}
          {item.mediaUrl && (
            <div className="my-4 text-center">
              <img 
                src={item.mediaUrl} 
                alt="Campaign visual"
                className="max-w-full h-auto rounded border"
              />
            </div>
          )}
        </div>
        
        {/* Email Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg text-xs text-gray-500 text-center">
          You received this email because you subscribed to our updates.
          <br />
          <a href="#" className="text-blue-600 hover:underline">Unsubscribe</a> | <a href="#" className="text-blue-600 hover:underline">View in browser</a>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold flex items-center">
        <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
        Generated Professional Content
      </h3>

      {/* Organic Social Posts Section */}
      {organicSocialPosts.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
            📱 Organic Social Posts
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {organicSocialPosts.map((item, index) => renderSocialMediaPost(item, index))}
          </div>
        </div>
      )}

      {/* Email Section */}
      {emailContent.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-green-600 border-b border-green-200 pb-2">
            📧 Email Marketing
          </h4>
          <div className="space-y-6">
            {emailContent.map((item, index) => renderEmailPost(item, index))}
          </div>
        </div>
      )}

    </div>
  );
};

export default GeneratedContentDisplay;
