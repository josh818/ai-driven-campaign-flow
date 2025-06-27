
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Copy, Download, Image, Video, FileText } from 'lucide-react';

interface GeneratedContent {
  type: 'copy' | 'image' | 'video';
  content: string;
  platform?: string;
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
    
    // Simulate AI content generation
    setTimeout(() => {
      const mockContent: GeneratedContent[] = [];
      
      if (formData.contentType === 'copy' || formData.contentType === 'all') {
        mockContent.push({
          type: 'copy',
          content: `🚀 Exciting news from ${formData.brand}! Our new ${formData.campaign} campaign is here to revolutionize your experience. Perfect for ${formData.audience || 'our amazing customers'}. ${formData.keywords ? `#${formData.keywords.split(',').join(' #')}` : ''} #Innovation #Quality #Excellence`,
          platform: formData.platform || 'social'
        });
      }
      
      if (formData.contentType === 'image' || formData.contentType === 'all') {
        mockContent.push({
          type: 'image',
          content: `AI-generated image concept: High-quality ${formData.tone || 'professional'} image featuring ${formData.brand} ${formData.campaign} campaign elements, optimized for ${formData.platform || 'social media'} with vibrant colors and modern design.`
        });
      }
      
      if (formData.contentType === 'video' || formData.contentType === 'all') {
        mockContent.push({
          type: 'video',
          content: `AI-generated video concept: 30-second ${formData.tone || 'engaging'} video showcasing ${formData.brand} ${formData.campaign}, featuring dynamic transitions, ${formData.audience || 'target audience'} testimonials, and clear call-to-action.`
        });
      }
      
      setGeneratedContent(mockContent);
      setIsGenerating(false);
      
      toast({
        title: "Content Generated",
        description: `Generated ${mockContent.length} piece(s) of content successfully!`,
      });
    }, 2000);
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content copied to clipboard!",
    });
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'copy': return <FileText className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            <span>AI Content Generator</span>
          </CardTitle>
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
                  <SelectItem value="copy">Copy/Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="all">All Types</SelectItem>
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              placeholder="innovation, quality, trusted, premium"
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGenerating ? (
              <>
                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Generated Content</h3>
          {generatedContent.map((item, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getContentIcon(item.type)}
                  <span className="capitalize">{item.type} Content</span>
                  {item.platform && (
                    <span className="text-sm text-gray-600">• {item.platform}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <pre className="whitespace-pre-wrap text-sm">{item.content}</pre>
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
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
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
