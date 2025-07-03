import React, { useState } from 'react';
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
import { Wand2, Calendar, Copy, Download, Facebook, Instagram, Twitter, Linkedin, Mail, Eye } from 'lucide-react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GeneratedContent {
  id: string;
  platform: string;
  contentType: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  scheduledFor?: string;
  status: string;
}

const ContentStudio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  
  const [campaignData, setCampaignData] = useState({
    title: '',
    description: '',
    brandName: '',
    targetAudience: '',
    tone: 'professional',
    campaignGoals: [] as string[]
  });

  const [contentSettings, setContentSettings] = useState({
    globalImagePrompt: '',
    globalVideoPrompt: '',
    platforms: ['facebook', 'instagram', 'linkedin', 'twitter', 'email'],
    contentTypes: ['copy', 'image', 'video']
  });

  const [activeTab, setActiveTab] = useState('create');

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, audience: 'Conversational, community-focused' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, audience: 'Visual, fun, lifestyle-focused' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, audience: 'Concise, trending, news-focused' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, audience: 'Professional, B2B, career-focused' },
    { id: 'email', name: 'Email', icon: Mail, audience: 'Direct, personal, detailed' }
  ];

  const contentTypes = [
    { id: 'copy', name: 'Copy Text', description: 'Engaging captions and headlines' },
    { id: 'image', name: 'Images', description: 'AI-generated visuals' },
    { id: 'video', name: 'Videos (5s)', description: 'Short-form video content' }
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual & Friendly' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'informative', label: 'Informative' },
    { value: 'humorous', label: 'Humorous' }
  ];

  const generateContent = async () => {
    if (!campaignData.title || !campaignData.description || !campaignData.brandName) {
      toast({
        title: "Missing Information",
        description: "Please fill in campaign title, description, and brand name",
        variant: "destructive"
      });
      return;
    }

    if (contentSettings.platforms.length === 0 || contentSettings.contentTypes.length === 0) {
      toast({
        title: "Missing Selection",
        description: "Please select at least one platform and content type",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create content requests for each platform/content type combination
      const contentRequests = contentSettings.platforms.flatMap(platform => 
        contentSettings.contentTypes.map(contentType => ({
          platform,
          contentType,
          mediaType: contentType === 'copy' ? 'text' : contentType
        }))
      );

      const { data, error } = await supabase.functions.invoke('generate-campaign-content', {
        body: {
          campaignData: {
            title: campaignData.title,
            brand_name: campaignData.brandName,
            description: campaignData.description,
            target_audience: campaignData.targetAudience,
            campaign_goals: campaignData.campaignGoals
          },
          contentRequests,
          aiSettings: {
            tone: campaignData.tone,
            customImagePrompt: contentSettings.globalImagePrompt,
            customVideoPrompt: contentSettings.globalVideoPrompt
          }
        }
      });

      if (error) throw error;

      if (data?.success && data?.generatedContent) {
        const formattedContent = data.generatedContent.map((item: any, index: number) => ({
          id: `content-${index}`,
          platform: item.platform,
          contentType: item.contentType,
          content: item.content,
          imageUrl: item.mediaUrl && item.contentType === 'image' ? item.mediaUrl : undefined,
          videoUrl: item.mediaUrl && item.contentType === 'video' ? item.mediaUrl : undefined,
          status: item.status || 'generated'
        }));

        setGeneratedContent(formattedContent);
        setActiveTab('preview');
        
        toast({
          title: "Content Generated!",
          description: `Successfully generated ${data.generatedContent.length} pieces of content`
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

  const updateScheduling = (contentId: string, dateTime: string) => {
    setGeneratedContent(prev => prev.map(item => 
      item.id === contentId ? { ...item, scheduledFor: dateTime } : item
    ));
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard"
    });
  };

  const renderPlatformPreview = (content: GeneratedContent) => {
    const platform = platforms.find(p => p.id === content.platform);
    if (!platform) return null;

    const IconComponent = platform.icon;

    switch (content.platform) {
      case 'email':
        return (
          <div className="bg-white border rounded-lg p-4 font-sans text-sm">
            <div className="border-b pb-3 mb-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>From: {campaignData.brandName} &lt;hello@{campaignData.brandName.toLowerCase().replace(/\s+/g, '')}.com&gt;</span>
                <span>To: subscriber@email.com</span>
              </div>
              <div className="mt-1 font-medium text-black">
                Subject: {content.content.split('\n')[0] || campaignData.title}
              </div>
            </div>
            <div className="space-y-3">
              <div className="whitespace-pre-wrap text-gray-800">{content.content}</div>
              {content.imageUrl && (
                <img src={content.imageUrl} alt="Email content" className="max-w-full h-auto rounded border" />
              )}
              {content.videoUrl && (
                <video controls className="w-full rounded border max-h-60">
                  <source src={content.videoUrl} type="video/mp4" />
                </video>
              )}
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="bg-white border rounded-lg overflow-hidden max-w-sm mx-auto">
            {/* Instagram Header */}
            <div className="flex items-center p-3 border-b">
              <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">{campaignData.brandName.charAt(0)}</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="font-semibold text-sm">{campaignData.brandName.toLowerCase().replace(/\s+/g, '')}</div>
              </div>
            </div>
            
            {/* Content Area */}
            {content.imageUrl && (
              <div className="aspect-square bg-gray-100">
                <img src={content.imageUrl} alt="Instagram post" className="w-full h-full object-cover" />
              </div>
            )}
            {content.videoUrl && (
              <div className="aspect-square bg-gray-100">
                <video controls className="w-full h-full object-cover">
                  <source src={content.videoUrl} type="video/mp4" />
                </video>
              </div>
            )}
            
            {/* Engagement Icons */}
            <div className="p-3">
              <div className="flex space-x-4 mb-2 text-gray-700">
                <span>♡</span>
                <span>💬</span>
                <span>📤</span>
              </div>
              <div className="text-sm">
                <div className="font-semibold mb-1">{campaignData.brandName.toLowerCase().replace(/\s+/g, '')}</div>
                <div className="whitespace-pre-wrap">{content.content}</div>
              </div>
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className="bg-white border rounded-lg overflow-hidden max-w-lg">
            {/* Facebook Header */}
            <div className="flex items-center p-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {campaignData.brandName.charAt(0)}
              </div>
              <div className="ml-3">
                <div className="font-semibold">{campaignData.brandName}</div>
                <div className="text-xs text-gray-500">2 hours ago · 🌍</div>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="px-4 pb-3">
              <div className="whitespace-pre-wrap text-gray-800">{content.content}</div>
            </div>
            
            {/* Media */}
            {content.imageUrl && (
              <img src={content.imageUrl} alt="Facebook post" className="w-full" />
            )}
            {content.videoUrl && (
              <video controls className="w-full">
                <source src={content.videoUrl} type="video/mp4" />
              </video>
            )}
            
            {/* Engagement */}
            <div className="px-4 py-3 border-t">
              <div className="flex justify-between text-sm text-gray-600">
                <span>👍 Like</span>
                <span>💬 Comment</span>
                <span>📤 Share</span>
              </div>
            </div>
          </div>
        );

      case 'linkedin':
        return (
          <div className="bg-white border rounded-lg overflow-hidden max-w-lg">
            {/* LinkedIn Header */}
            <div className="flex items-center p-4">
              <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                {campaignData.brandName.charAt(0)}
              </div>
              <div className="ml-3">
                <div className="font-semibold">{campaignData.brandName}</div>
                <div className="text-sm text-gray-600">Company · 1,234 followers</div>
                <div className="text-xs text-gray-500">2h · 🌍</div>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="px-4 pb-3">
              <div className="whitespace-pre-wrap text-gray-800">{content.content}</div>
            </div>
            
            {/* Media */}
            {content.imageUrl && (
              <img src={content.imageUrl} alt="LinkedIn post" className="w-full" />
            )}
            {content.videoUrl && (
              <video controls className="w-full">
                <source src={content.videoUrl} type="video/mp4" />
              </video>
            )}
            
            {/* Engagement */}
            <div className="px-4 py-3 border-t">
              <div className="flex justify-between text-sm text-gray-600">
                <span>👍 Like</span>
                <span>💬 Comment</span>
                <span>🔄 Repost</span>
                <span>📤 Send</span>
              </div>
            </div>
          </div>
        );

      case 'twitter':
        return (
          <div className="bg-white border rounded-lg overflow-hidden max-w-lg">
            {/* Twitter Header */}
            <div className="flex items-start p-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {campaignData.brandName.charAt(0)}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center space-x-1">
                  <span className="font-bold">{campaignData.brandName}</span>
                  <span className="text-gray-500">@{campaignData.brandName.toLowerCase().replace(/\s+/g, '')}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">2h</span>
                </div>
                <div className="mt-1 whitespace-pre-wrap text-gray-800">{content.content}</div>
                
                {/* Media */}
                {content.imageUrl && (
                  <img src={content.imageUrl} alt="Twitter post" className="w-full rounded-xl mt-3 border" />
                )}
                {content.videoUrl && (
                  <video controls className="w-full rounded-xl mt-3 border">
                    <source src={content.videoUrl} type="video/mp4" />
                  </video>
                )}
                
                {/* Engagement */}
                <div className="flex justify-between max-w-md mt-3 text-gray-500 text-sm">
                  <span>💬 Reply</span>
                  <span>🔄 Retweet</span>
                  <span>❤️ Like</span>
                  <span>📤 Share</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <IconComponent className="h-5 w-5" />
                <span className="font-medium capitalize">{content.platform}</span>
                <Badge variant="secondary">{content.contentType}</Badge>
              </div>
              <div className="whitespace-pre-wrap text-sm">{content.content}</div>
              {content.imageUrl && (
                <img src={content.imageUrl} alt="Generated content" className="mt-3 w-full rounded border" />
              )}
              {content.videoUrl && (
                <video controls className="mt-3 w-full rounded border">
                  <source src={content.videoUrl} type="video/mp4" />
                </video>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Studio</h1>
          <p className="text-gray-600">Create platform-native content that converts</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Campaign</TabsTrigger>
            <TabsTrigger value="preview">Preview & Schedule</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Campaign Setup */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Campaign Title *</Label>
                      <Input
                        value={campaignData.title}
                        onChange={(e) => setCampaignData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Summer Product Launch"
                      />
                    </div>

                    <div>
                      <Label>Campaign Description *</Label>
                      <Textarea
                        value={campaignData.description}
                        onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your campaign goals, key messages, and what you want to promote..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Brand Name *</Label>
                      <Input
                        value={campaignData.brandName}
                        onChange={(e) => setCampaignData(prev => ({ ...prev, brandName: e.target.value }))}
                        placeholder="Your Brand Name"
                      />
                    </div>

                    <div>
                      <Label>Target Audience</Label>
                      <Input
                        value={campaignData.targetAudience}
                        onChange={(e) => setCampaignData(prev => ({ ...prev, targetAudience: e.target.value }))}
                        placeholder="e.g., Working professionals aged 25-40"
                      />
                    </div>

                    <div>
                      <Label>Brand Tone</Label>
                      <Select 
                        value={campaignData.tone} 
                        onValueChange={(value) => setCampaignData(prev => ({ ...prev, tone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map(tone => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Content Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Global Image Prompt</Label>
                      <Textarea
                        value={contentSettings.globalImagePrompt}
                        onChange={(e) => setContentSettings(prev => ({ ...prev, globalImagePrompt: e.target.value }))}
                        placeholder="Describe the visual style: modern office setting, natural lighting, professional people, vibrant brand colors..."
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Be specific about style, lighting, colors, and composition for better results
                      </p>
                    </div>

                    <div>
                      <Label>Global Video Prompt</Label>
                      <Textarea
                        value={contentSettings.globalVideoPrompt}
                        onChange={(e) => setContentSettings(prev => ({ ...prev, globalVideoPrompt: e.target.value }))}
                        placeholder="Describe the 5-second video: smooth camera movement, product showcase, dynamic transitions..."
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        🎬 Think cinematically - describe movements, pacing, and visual flow
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Platform & Content Selection */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platforms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {platforms.map(platform => {
                        const IconComponent = platform.icon;
                        const isSelected = contentSettings.platforms.includes(platform.id);
                        return (
                          <div
                            key={platform.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setContentSettings(prev => ({
                                ...prev,
                                platforms: isSelected 
                                  ? prev.platforms.filter(p => p !== platform.id)
                                  : [...prev.platforms, platform.id]
                              }));
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-5 w-5" />
                              <div className="flex-1">
                                <div className="font-medium">{platform.name}</div>
                                <div className="text-xs text-gray-500">{platform.audience}</div>
                              </div>
                              {isSelected && <span className="text-blue-600">✓</span>}
                            </div>
                          </div>
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
                    <div className="space-y-3">
                      {contentTypes.map(type => {
                        const isSelected = contentSettings.contentTypes.includes(type.id);
                        return (
                          <div
                            key={type.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setContentSettings(prev => ({
                                ...prev,
                                contentTypes: isSelected 
                                  ? prev.contentTypes.filter(t => t !== type.id)
                                  : [...prev.contentTypes, type.id]
                              }));
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{type.name}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                              {isSelected && <span className="text-blue-600">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={generateContent}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {generatedContent.length > 0 ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Generated Content ({generatedContent.length})</h2>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {generatedContent.map((content) => (
                    <Card key={content.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {platforms.find(p => p.id === content.platform)?.icon && (
                              React.createElement(platforms.find(p => p.id === content.platform)!.icon, { className: "h-4 w-4" })
                            )}
                            <span className="font-medium capitalize">{content.platform}</span>
                            <Badge variant="secondary" className="text-xs">{content.contentType}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(content.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Platform-native preview */}
                        <div className="border rounded-lg overflow-hidden">
                          {renderPlatformPreview(content)}
                        </div>
                        
                        {/* Scheduling */}
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Schedule Post</Label>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <Input
                              type="datetime-local"
                              value={content.scheduledFor || ''}
                              onChange={(e) => updateScheduling(content.id, e.target.value)}
                              className="text-sm flex-1"
                            />
                          </div>
                          {content.scheduledFor && (
                            <Badge variant="outline" className="text-xs">
                              Scheduled for {new Date(content.scheduledFor).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Generated Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first campaign to see platform-native previews here</p>
                  <Button onClick={() => setActiveTab('create')} variant="outline">
                    Start Creating
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Calendar view coming soon - schedule and manage all your content in one place</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentStudio;