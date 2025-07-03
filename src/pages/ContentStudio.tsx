import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Calendar, Copy, Download, Facebook, Instagram, Twitter, Linkedin, Mail, X } from 'lucide-react';
import Header from '@/components/Header';

interface GeneratedContent {
  platform: string;
  contentType: string;
  content: string;
  mediaUrl?: string;
  status: string;
  scheduledFor?: string;
}

const ContentStudio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  
  const [formData, setFormData] = useState({
    campaignTitle: '',
    campaignDescription: '',
    brandName: '',
    targetAudience: '',
    tone: 'professional'
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['copy']);

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'email', name: 'Email', icon: Mail }
  ];

  const contentTypes = [
    { id: 'copy', name: 'Copy Text' },
    { id: 'image', name: 'Images' },
    { id: 'video', name: 'Videos (5s)' }
  ];

  const tones = ['professional', 'casual', 'enthusiastic', 'informative', 'humorous'];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const toggleContentType = (typeId: string) => {
    setSelectedContentTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const generateContent = async () => {
    if (!formData.campaignTitle || !formData.campaignDescription || !formData.brandName) {
      toast({
        title: "Missing Information",
        description: "Please fill in campaign title, description, and brand name",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0 || selectedContentTypes.length === 0) {
      toast({
        title: "Missing Selection",
        description: "Please select at least one platform and content type",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          ...formData,
          platforms: selectedPlatforms,
          contentTypes: selectedContentTypes
        }
      });

      if (error) throw error;

      if (data?.success && data?.content) {
        setGeneratedContent(data.content);
        toast({
          title: "Content Generated!",
          description: `Successfully generated ${data.content.length} pieces of content`
        });
      } else {
        throw new Error(data?.error || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard"
    });
  };

  const scheduleContent = (index: number, dateTime: string) => {
    setGeneratedContent(prev => prev.map((item, i) => 
      i === index ? { ...item, scheduledFor: dateTime } : item
    ));
    toast({
      title: "Scheduled!",
      description: "Content scheduled successfully"
    });
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    if (!platformData) return null;
    const IconComponent = platformData.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  const renderContentPreview = (item: GeneratedContent, index: number) => {
    const isEmail = item.platform === 'email';
    
    return (
      <Card key={index} className="border border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPlatformIcon(item.platform)}
              <span className="font-medium capitalize">{item.platform}</span>
              <Badge variant="secondary" className="text-xs">{item.contentType}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(item.content)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              {item.mediaUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(item.mediaUrl, '_blank')}
                >
                  <Download className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Native Platform Preview */}
          <div className={`border rounded-lg p-4 ${isEmail ? 'bg-white' : 'bg-gray-50'}`}>
            {isEmail ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 border-b pb-2">
                  <div>From: {formData.brandName} &lt;hello@{formData.brandName.toLowerCase()}.com&gt;</div>
                  <div>Subject: {item.content.split('\n')[0] || 'Campaign Update'}</div>
                </div>
                <div className="text-sm whitespace-pre-wrap">{item.content}</div>
                {item.mediaUrl && (
                  <img src={item.mediaUrl} alt="Email content" className="max-w-full h-auto rounded" />
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {formData.brandName.charAt(0)}
                  </div>
                  <div className="font-medium">{formData.brandName}</div>
                </div>
                <div className="text-sm whitespace-pre-wrap">{item.content}</div>
                {item.mediaUrl && (
                  <div className="relative">
                    {item.contentType === 'video' ? (
                      <video 
                        controls 
                        className="w-full rounded-lg max-h-60"
                        poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjVzIFZpZGVvPC90ZXh0Pgo8L3N2Zz4="
                      >
                        <source src={item.mediaUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <img src={item.mediaUrl} alt="Generated content" className="w-full rounded-lg max-h-60 object-cover" />
                    )}
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>📤 Share</span>
                </div>
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Input
              type="datetime-local"
              value={item.scheduledFor || ''}
              onChange={(e) => scheduleContent(index, e.target.value)}
              className="text-sm"
            />
            {item.scheduledFor && (
              <Badge variant="outline" className="text-xs">
                Scheduled
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Studio</h1>
          <p className="text-gray-600">Create engaging content for all your marketing channels</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Creation Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Campaign Title *</Label>
                  <Input
                    value={formData.campaignTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, campaignTitle: e.target.value }))}
                    placeholder="Enter campaign title"
                  />
                </div>

                <div>
                  <Label>Campaign Description *</Label>
                  <Textarea
                    value={formData.campaignDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, campaignDescription: e.target.value }))}
                    placeholder="Describe your campaign..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Brand Name *</Label>
                  <Input
                    value={formData.brandName}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="Your brand name"
                  />
                </div>

                <div>
                  <Label>Target Audience</Label>
                  <Input
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="e.g., Young professionals, 25-35"
                  />
                </div>

                <div>
                  <Label>Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map(tone => (
                        <SelectItem key={tone} value={tone} className="capitalize">{tone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map(platform => {
                    const IconComponent = platform.icon;
                    return (
                      <Button
                        key={platform.id}
                        variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePlatform(platform.id)}
                        className="justify-start"
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        {platform.name}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contentTypes.map(type => (
                    <Button
                      key={type.id}
                      variant={selectedContentTypes.includes(type.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleContentType(type.id)}
                      className="w-full justify-start"
                    >
                      {type.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={generateContent}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </div>

          {/* Generated Content Display */}
          <div className="lg:col-span-2">
            {generatedContent.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Generated Content ({generatedContent.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedContent.map((item, index) => renderContentPreview(item, index))}
                </div>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Create Content</h3>
                  <p className="text-gray-600">Fill in the details and generate engaging content for your campaigns</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;