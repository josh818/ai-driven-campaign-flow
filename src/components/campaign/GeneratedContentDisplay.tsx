
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, Image, Video, FileText, Sparkles, Play, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedContent {
  type: 'copy' | 'image' | 'video' | 'email';
  content: string;
  platform?: string;
  mediaUrl?: string;
}

interface GeneratedContentDisplayProps {
  content: GeneratedContent[];
}

const GeneratedContentDisplay = ({ content }: GeneratedContentDisplayProps) => {
  const { toast } = useToast();

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

  // Group content by category
  const organicSocialPosts = content.filter(item => 
    item.type === 'copy' && item.platform && ['facebook', 'instagram', 'twitter', 'linkedin'].includes(item.platform)
  );
  
  const paidSocialAds = content.filter(item => 
    (item.type === 'image' || item.type === 'video') && item.platform && ['facebook', 'instagram', 'twitter', 'linkedin'].includes(item.platform)
  );
  
  const emailContent = content.filter(item => 
    item.type === 'email' || item.platform === 'email'
  );

  const renderContentCard = (item: GeneratedContent, index: number) => (
    <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          {getPlatformIcon(item.platform || '')}
          <span className="capitalize text-sm font-medium">
            {item.platform || 'Social'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
          <pre className="whitespace-pre-wrap text-sm font-sans">{item.content}</pre>
        </div>
        
        {item.mediaUrl && (
          <div className="mb-4">
            {item.type === 'video' ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video 
                  controls 
                  className="w-full max-h-64 object-contain"
                  poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFJIFZpZGVvPC90ZXh0Pgo8L3N2Zz4="
                >
                  <source src={item.mediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Play className="h-12 w-12 text-white opacity-70" />
                </div>
              </div>
            ) : item.type === 'image' ? (
              <img 
                src={item.mediaUrl} 
                alt="Generated content"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
            ) : null}
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(item.content)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </Button>
          
          {item.mediaUrl && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => downloadMedia(item.mediaUrl!, `${item.type}-${Date.now()}.${item.type === 'video' ? 'mp4' : 'png'}`)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download {item.type === 'video' ? 'Video' : 'Image'}
            </Button>
          )}
        </div>
      </CardContent>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organicSocialPosts.map((item, index) => renderContentCard(item, index))}
          </div>
        </div>
      )}

      {/* Email Section */}
      {emailContent.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-green-600 border-b border-green-200 pb-2">
            📧 Email Marketing
          </h4>
          <div className="space-y-4">
            {emailContent.map((item, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Email Campaign</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4" style={{fontFamily: 'Arial, sans-serif'}}>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">{item.content}</pre>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Paid Social Ads Section */}
      {paidSocialAds.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">
            🎯 Paid Social Ads
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paidSocialAds.map((item, index) => renderContentCard(item, index))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedContentDisplay;
