import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Wand2 } from 'lucide-react';
import Header from '@/components/Header';
import CampaignDetailsForm from '@/components/campaign/CampaignDetailsForm';
import AIContentSettings from '@/components/campaign/AIContentSettings';
import BudgetScheduleForm from '@/components/campaign/BudgetScheduleForm';
import GeneratedContentDisplay from '@/components/campaign/GeneratedContentDisplay';

interface GeneratedContent {
  type: 'copy' | 'image' | 'video';
  content: string;
  platform?: string;
  mediaUrl?: string;
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
    
    try {
      // Call the actual Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-campaign-content', {
        body: {
          campaignId: null, // Will be created later
          campaignData: formData,
          aiSettings: aiFormData
        }
      });

      if (error) throw error;

      // Convert the response to our expected format
      const mockContent: GeneratedContent[] = [];
      
      if (data.preview && Array.isArray(data.preview)) {
        data.preview.forEach((item: any) => {
          if (item.media_type === 'copy') {
            mockContent.push({
              type: 'copy',
              content: item.content || 'Generated copy content',
              platform: item.platform
            });
          } else if (item.media_type === 'image') {
            mockContent.push({
              type: 'image',
              content: item.content || 'Generated professional image',
              platform: item.platform,
              mediaUrl: item.media_url || undefined
            });
          } else if (item.media_type === 'video') {
            mockContent.push({
              type: 'video',
              content: item.content || 'Generated video concept and script',
              platform: item.platform,
              mediaUrl: item.media_url || undefined
            });
          }
        });
      }

      setGeneratedContent(mockContent);
      
      toast({
        title: "Content Generated Successfully",
        description: `Generated ${data.generatedCount} professional content pieces using AI!`,
      });
      
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to mock content for development
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
          content: `AI-generated image: High-quality ${aiFormData.tone || 'professional'} image featuring ${formData.brand_name} ${formData.title} campaign elements, optimized for ${aiFormData.platform || 'social media'} with vibrant colors and modern design.`
        });
      }
      
      if (aiFormData.contentType === 'video' || aiFormData.contentType === 'all') {
        mockContent.push({
          type: 'video',
          content: `AI-generated video script: 30-second ${aiFormData.tone || 'engaging'} video showcasing ${formData.brand_name} ${formData.title}, featuring dynamic transitions, ${formData.target_audience || 'target audience'} testimonials, and clear call-to-action.`
        });
      }
      
      setGeneratedContent(mockContent);
    } finally {
      setIsGeneratingContent(false);
    }
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

      // If we have generated content, save it to the campaign
      if (generatedContent.length > 0) {
        const { error: contentError } = await supabase.functions.invoke('generate-campaign-content', {
          body: {
            campaignId: data.id,
            campaignData: formData,
            aiSettings: aiFormData
          }
        });

        if (contentError) {
          console.error('Error saving generated content:', contentError);
          toast({
            title: "Campaign Created",
            description: "Campaign created but there was an issue saving the generated content.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Campaign Created Successfully!",
            description: "Your campaign has been created with AI-generated professional content.",
          });
        }
      } else {
        toast({
          title: "Campaign Created!",
          description: "Your campaign has been saved.",
        });
      }

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

  const handleAIFormChange = (field: string, value: string) => {
    setAiFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-blue-600" />
                <span>Professional Campaign & AI Content Generator</span>
              </CardTitle>
              <p className="text-sm text-gray-600">Create your campaign and generate professional AI-powered content by our 20+ year experts</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <CampaignDetailsForm
                formData={formData}
                onChange={handleInputChange}
                onGoalsChange={handleGoalsChange}
              />

              <AIContentSettings
                formData={formData}
                aiFormData={aiFormData}
                onInputChange={handleInputChange}
                onAIFormChange={handleAIFormChange}
                onGenerate={handleGenerateContent}
                isGenerating={isGeneratingContent}
              />

              <BudgetScheduleForm
                formData={formData}
                onChange={handleInputChange}
              />
            </CardContent>
          </Card>

          <GeneratedContentDisplay content={generatedContent} />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            disabled={isLoading || isGeneratingContent}
            size="lg"
          >
            {isLoading ? (
              <>
                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Professional Campaign...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Create Campaign & Save Professional Content
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
