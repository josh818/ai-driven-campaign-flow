import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wand2, Copy, Download, Image, Video, FileText, ExternalLink } from 'lucide-react';
import { getFileUrl, downloadFile } from '@/lib/storage-utils';

interface GeneratedContent {
  type: 'copy' | 'image' | 'video';
  content: string;
  platform?: string;
  mediaUrl?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
}

const AIContentGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [formData, setFormData] = useState({
    brand: '',
    campaign: '',
    audience: '',
    contentType: '',
    platform: '',
    tone: '',
    keywords: ''
  });

  const handleGenerate = async () => {
    if (!formData.brand || !formData.campaign || !formData.contentType) {
      toast({
        title: "Missing Information",
        description: "Please fill in brand, campaign, and content type.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call the Supabase Edge Function for real content generation
      const { data, error } = await supabase.functions.invoke('generate-campaign-content', {
        body: {
          campaignData: {
            id: null, // Will be created later
            title: formData.campaign,
            brand_name: formData.brand,
            target_audience: formData.audience,
            campaign_goals: ['brand awareness', 'engagement']
          },
          contentRequests: (() => {
            const requests = [];
            const platforms = formData.platform === 'all' 
              ? ['facebook', 'instagram', 'linkedin', 'twitter']
              : [formData.platform || 'facebook'];
            
            platforms.forEach(platform => {
              if (formData.contentType === 'all' || formData.contentType === 'copy') {
                requests.push({
                  platform,
                  contentType: 'copy',
                  mediaType: 'text'
                });
              }
              if (formData.contentType === 'all' || formData.contentType === 'image') {
                requests.push({
                  platform,
                  contentType: 'image',
                  mediaType: 'image'
                });
              }
              if (formData.contentType === 'all' || formData.contentType === 'video') {
                requests.push({
                  platform,
                  contentType: 'video',
                  mediaType: 'video'
                });
              }
            });
            return requests;
          })(),
          aiSettings: {
            contentType: formData.contentType,
            platform: formData.platform,
            tone: formData.tone,
            keywords: formData.keywords
          }
        }
      });

      if (error) throw error;

      // Convert API response to our format
      const newContent: GeneratedContent[] = [];
      
      if (data.generatedContent && Array.isArray(data.generatedContent)) {
        data.generatedContent.forEach((item: any) => {
          newContent.push({
            type: item.mediaType === 'text' ? 'copy' : item.mediaType as 'copy' | 'image' | 'video',
            content: item.content || `Generated ${item.mediaType} content`,
            platform: item.platform,
            mediaUrl: item.mediaUrl,
            filePath: item.filePath,
            fileSize: item.fileSize,
            mimeType: item.mimeType
          });
        });
      }

      setGeneratedContent(newContent);
      
      toast({
        title: "Professional Content Generated",
        description: `Generated ${newContent.length} piece(s) of professional content using AI!`,
      });
      
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive"
      });
      
      // Content generation failed - no fallback content provided
      setGeneratedContent([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Professional content copied to clipboard!",
    });
  };

  const handleDownloadMedia = async (item: GeneratedContent) => {
    if (!item.filePath) {
      toast({
        title: "Download Failed",
        description: "No file path available for download.",
        variant: "destructive"
      });
      return;
    }

    try {
      await downloadFile(item.filePath, `${item.type}_${item.platform || 'content'}`);
      toast({
        title: "Downloaded",
        description: "Media file downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download media file.",
        variant: "destructive"
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'copy': return <FileText className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-blue-600" />
            <span>Professional AI Content Generator</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Generate professional marketing content powered by AI with proper file storage</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand Name</Label>
              <Input
                id="brand"
                placeholder="Enter your brand name"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign Name</Label>
              <Input
                id="campaign"
                placeholder="Enter campaign name"
                value={formData.campaign}
                onChange={(e) => setFormData(prev => ({ ...prev, campaign: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., young professionals, families"
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={formData.contentType} onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="copy">Professional Copy/Text</SelectItem>
                  <SelectItem value="image">Professional Image</SelectItem>
                  <SelectItem value="video">Professional Video</SelectItem>
                  <SelectItem value="all">All Content Types</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="all">All Platforms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Professional Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Corporate Professional</SelectItem>
                  <SelectItem value="casual">Approachable Professional</SelectItem>
                  <SelectItem value="enthusiastic">Dynamic Professional</SelectItem>
                  <SelectItem value="informative">Expert Informative</SelectItem>
                  <SelectItem value="humorous">Engaging Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              placeholder="innovation, quality, trusted, premium, professional"
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            {isGenerating ? (
              <>
                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Professional Content...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Professional Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Generated Professional Content</h3>
          {generatedContent.map((item, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getContentIcon(item.type)}
                  <span className="capitalize">Professional {item.type} Content</span>
                  {item.platform && (
                    <span className="text-sm text-gray-600">• {item.platform}</span>
                  )}
                  {item.fileSize && (
                    <span className="text-xs text-gray-500">• {formatFileSize(item.fileSize)}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <pre className="whitespace-pre-wrap text-sm">{item.content}</pre>
                  {item.mediaUrl && (
                    <div className="mt-4">
                      {item.type === 'image' && (
                        <img 
                          src={item.mediaUrl} 
                          alt="Generated content" 
                          className="max-w-full h-auto rounded-lg shadow-sm"
                        />
                      )}
                      {item.type === 'video' && (
                        <video 
                          src={item.mediaUrl} 
                          controls 
                          className="max-w-full h-auto rounded-lg shadow-sm"
                        />
                      )}
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                        📎 Media content stored in secure cloud storage
                        {item.filePath && (
                          <div className="text-xs text-blue-600 mt-1">
                            File: {item.filePath}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(item.content)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  {item.mediaUrl && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(item.mediaUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadMedia(item)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIContentGenerator;
