
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Wand2, Sparkles, Copy, Download, Image, Video, FileText } from 'lucide-react';
import Header from '@/components/Header';

interface GeneratedContent {
  type: 'copy' | 'image' | 'video';
  content: string;
  platform?: string;
}

const CreateCampaign = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  
  // Campaign form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand_name: '',
    target_audience: '',
    campaign_goals: [] as string[],
    budget: '',
    start_date: '',
    end_date: ''
  });

  // AI content generation data
  const [aiFormData, setAiFormData] = useState({
    contentType: '',
    platform: '',
    tone: '',
    keywords: ''
  });

  const generateCampaignContent = async (campaignId: string) => {
    setIsGeneratingContent(true);
    try {
      const response = await supabase.functions.invoke('generate-campaign-content', {
        body: {
          campaignId,
          campaignData: formData
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Content Generated!",
        description: `Generated ${response.data.generatedCount} pieces of content across all platforms.`,
      });
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Content Generation Failed",
        description: "Campaign created but content generation failed. You can generate content later.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!formData.brand_name || !formData.title || !aiFormData.contentType) {
      toast({
        title: "Missing Information",
        description: "Please fill in brand, campaign, and content type.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingContent(true);
    
    // Simulate AI content generation with more detailed content
    setTimeout(() => {
      const mockContent: GeneratedContent[] = [];
      
      if (aiFormData.contentType === 'copy' || aiFormData.contentType === 'all') {
        mockContent.push({
          type: 'copy',
          content: `🚀 Exciting news from ${formData.brand_name}! Our new ${formData.title} campaign is here to revolutionize your experience. Perfect for ${formData.target_audience || 'our amazing customers'}. ${aiFormData.keywords ? `#${aiFormData.keywords.split(',').join(' #')}` : ''} #Innovation #Quality #Excellence`,
          platform: aiFormData.platform || 'social'
        });
      }
      
      if (aiFormData.contentType === 'image' || aiFormData.contentType === 'all') {
        mockContent.push({
          type: 'image',
          content: `AI-generated image concept: High-quality ${aiFormData.tone || 'professional'} image featuring ${formData.brand_name} ${formData.title} campaign elements, optimized for ${aiFormData.platform || 'social media'} with vibrant colors and modern design.`
        });
      }
      
      if (aiFormData.contentType === 'video' || aiFormData.contentType === 'all') {
        mockContent.push({
          type: 'video',
          content: `AI-generated video concept: 30-second ${aiFormData.tone || 'engaging'} video showcasing ${formData.brand_name} ${formData.title}, featuring dynamic transitions, ${formData.target_audience || 'target audience'} testimonials, and clear call-to-action.`
        });
      }
      
      setGeneratedContent(mockContent);
      setIsGeneratingContent(false);
      
      toast({
        title: "Content Generated",
        description: `Generated ${mockContent.length} piece(s) of content successfully!`,
      });
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { title, description, brand_name, target_audience, campaign_goals, budget, start_date, end_date } = formData;

      if (!title || !description || !brand_name) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user!.id,
          title,
          description,
          brand_name,
          target_audience,
          campaign_goals,
          budget: budget ? parseFloat(budget) : null,
          start_date,
          end_date,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Campaign Created!",
        description: "Your campaign has been saved with the generated content.",
      });

      navigate('/campaigns');
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      campaign_goals: value.split(',').map(item => item.trim())
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Create Campaign with AI</h2>
            <p className="text-gray-600">Generate professional marketing content powered by AI</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Combined Campaign & AI Content Generation Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-blue-600" />
                <span>Campaign & AI Content Generator</span>
              </CardTitle>
              <p className="text-sm text-gray-600">Create your campaign and generate AI-powered content</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Description and Goals - Top */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand_name">Brand Name *</Label>
                    <Input
                      id="brand_name"
                      name="brand_name"
                      placeholder="Enter your brand name"
                      value={formData.brand_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Name *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter campaign name"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your campaign objectives and key messaging"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign_goals">Campaign Goals (comma-separated)</Label>
                  <Input
                    id="campaign_goals"
                    name="campaign_goals"
                    placeholder="increase brand awareness, drive sales, engagement"
                    value={formData.campaign_goals.join(', ')}
                    onChange={handleGoalsChange}
                  />
                </div>
              </div>

              {/* AI Content Generation Settings */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  AI Content Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Input
                      id="target_audience"
                      name="target_audience"
                      placeholder="e.g., young professionals, families"
                      value={formData.target_audience}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select value={aiFormData.contentType} onValueChange={(value) => setAiFormData(prev => ({ ...prev, contentType: value }))}>
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
                    <Select value={aiFormData.platform} onValueChange={(value) => setAiFormData(prev => ({ ...prev, platform: value }))}>
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
                    <Select value={aiFormData.tone} onValueChange={(value) => setAiFormData(prev => ({ ...prev, tone: value }))}>
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

                <div className="space-y-2 mt-4">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="innovation, quality, trusted, premium"
                    value={aiFormData.keywords}
                    onChange={(e) => setAiFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  />
                </div>

                <Button 
                  type="button"
                  onClick={handleGenerateContent}
                  disabled={isGeneratingContent}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  {isGeneratingContent ? (
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
              </div>

              {/* Budget and Schedule - Bottom */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">Budget & Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      placeholder="Enter budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Content Display */}
          {generatedContent.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                Generated Content
              </h3>
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
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(item.content)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button type="button" variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Single Save Campaign Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            disabled={isLoading || isGeneratingContent}
            size="lg"
          >
            {isLoading ? (
              <>
                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Campaign...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Create Campaign & Save Content
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
