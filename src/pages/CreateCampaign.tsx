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
import BrandSetupForm from '@/components/campaign/BrandSetupForm';
import ContentCreationSteps from '@/components/campaign/ContentCreationSteps';
import EnhancedEmailPreview from '@/components/campaign/EnhancedEmailPreview';
import EnhancedSocialPreview from '@/components/campaign/EnhancedSocialPreview';
import PaidAdSettings from '@/components/campaign/PaidAdSettings';

interface GeneratedContent {
  type: 'copy' | 'image' | 'video' | 'email';
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
    budget_type: 'campaign_budget',
    start_date: '',
    end_date: '',
    campaign_type: 'organic'
  });

  // Brand setup data
  const [brandData, setBrandData] = useState({
    brand_name: '',
    brand_voice: '',
    brand_values: [] as string[],
    target_demographics: '',
    brand_colors: [] as string[],
    competitors: [] as string[],
    unique_selling_points: [] as string[]
  });

  // Advanced content settings
  const [contentSettings, setContentSettings] = useState({
    platforms: ['facebook', 'instagram'],
    contentTypes: ['copy', 'image', 'email'],
    scheduling: {
      autoSchedule: false,
      timeSlots: [] as string[],
      frequency: 'daily'
    },
    visualStyle: {
      template: 'modern',
      colorScheme: 'brand',
      fontSize: 16,
      fontStyle: 'sans-serif'
    },
    optimization: {
      audienceTargeting: true,
      hashtagSuggestions: true,
      bestTimePosting: true
    }
  });

  // Paid ad settings
  const [adSettings, setAdSettings] = useState({
    platforms: [] as string[],
    campaignObjective: '',
    targetAudience: {
      demographics: {
        ageRange: [18, 45] as [number, number],
        gender: 'all',
        locations: [] as string[],
        languages: ['English'] as string[]
      },
      interests: [] as string[],
      behaviors: [] as string[],
      customAudiences: [] as string[]
    },
    budgetStrategy: {
      budgetType: 'daily',
      totalBudget: 0,
      dailyBudget: 0,
      bidStrategy: 'lowest_cost',
      maxCPC: 0
    },
    adPlacements: {
      facebook: [] as string[],
      instagram: [] as string[],
      google: [] as string[],
      youtube: [] as string[],
      tiktok: [] as string[]
    },
    scheduling: {
      startDate: '',
      endDate: '',
      dayParting: false,
      timeZone: 'UTC',
      scheduleSlots: [] as string[]
    },
    optimization: {
      conversionGoal: '',
      roasTarget: 0,
      frequencyCap: 0,
      autoOptimization: true
    }
  });

  // AI content generation data
  const [aiFormData, setAiFormData] = useState({
    contentType: '',
    platform: 'all',
    tone: '',
    keywords: '',
    campaignType: 'organic',
    imagePrompt: '',
    videoPrompt: ''
  });

  const handleGenerateContent = async () => {
    // Enhanced validation for paid ads
    if (formData.campaign_type === 'paid_ad') {
      if (!formData.brand_name || !formData.title || adSettings.platforms.length === 0 || !adSettings.campaignObjective) {
        toast({
          title: "Missing Paid Ad Information",
          description: "Please fill in brand name, campaign title, select ad platforms, and campaign objective.",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!formData.brand_name || !formData.title || contentSettings.platforms.length === 0 || contentSettings.contentTypes.length === 0) {
        toast({
          title: "Missing Information",
          description: "Please fill in brand name, campaign title, select platforms and content types.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsGeneratingContent(true);
    
    try {
      console.log('Starting content generation with enhanced prompts...');
      
      // Call the actual Supabase Edge Function with optimized data structure
      const { data, error } = await supabase.functions.invoke('generate-campaign-content', {
        body: {
          campaignData: {
            id: null, // Will be created later
            title: formData.title,
            brand_name: formData.brand_name,
            description: formData.description,
            target_audience: formData.target_audience,
            campaign_goals: formData.campaign_goals
          },
          contentRequests: (() => {
            const requests = [];
            
            // Generate content for each selected platform
            contentSettings.platforms.forEach(platform => {
              if (contentSettings.contentTypes.includes('copy')) {
                requests.push({
                  platform: platform,
                  contentType: 'copy',
                  mediaType: 'text'
                });
              }
              if (contentSettings.contentTypes.includes('image')) {
                requests.push({
                  platform: platform,
                  contentType: 'image',
                  mediaType: 'image'
                });
              }
              if (contentSettings.contentTypes.includes('video')) {
                requests.push({
                  platform: platform,
                  contentType: 'video',
                  mediaType: 'video'
                });
              }
            });
            
            // Add email if selected
            if (contentSettings.contentTypes.includes('email')) {
              requests.push({
                platform: 'email',
                contentType: 'email',
                mediaType: 'text'
              });
            }
            
            return requests;
          })(),
          aiSettings: {
            brandData: brandData,
            contentSettings: contentSettings,
            adSettings: formData.campaign_type === 'paid_ad' ? adSettings : null,
            tone: aiFormData.tone || 'professional',
            keywords: aiFormData.keywords || '',
            customImagePrompt: aiFormData.imagePrompt,
            customVideoPrompt: aiFormData.videoPrompt
          }
        }
      });

      if (error) throw error;

      // Convert the response to our expected format
      const newContent: GeneratedContent[] = [];
      
      if (data.generatedContent && Array.isArray(data.generatedContent)) {
        data.generatedContent.forEach((item: any) => {
          if (item.mediaType === 'text' || item.mediaType === 'copy') {
            newContent.push({
              type: 'copy',
              content: item.content || 'Generated copy content',
              platform: item.platform
            });
          } else if (item.mediaType === 'image') {
            newContent.push({
              type: 'image',
              content: item.content || 'Generated professional image',
              platform: item.platform,
              mediaUrl: item.mediaUrl || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop'
            });
          } else if (item.mediaType === 'video') {
            newContent.push({
              type: 'video',
              content: item.content || 'Generated video concept and script',
              platform: item.platform,
              mediaUrl: item.mediaUrl || undefined
            });
          } else if (item.mediaType === 'email') {
            newContent.push({
              type: 'email',
              content: item.content || 'Generated email content',
              platform: 'email'
            });
          }
        });
      }

      setGeneratedContent(newContent);
      
      toast({
        title: "Content Generated Successfully",
        description: `Generated ${newContent.length} professional content pieces using AI!`,
      });
      
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive"
      });
      
      // Enhanced fallback content based on selected content types
      const mockContent: GeneratedContent[] = [];
      
      if (contentSettings.contentTypes.includes('copy')) {
        const tonePrefix = aiFormData.tone === 'casual' ? 'Hey there! 😊' :
                          aiFormData.tone === 'enthusiastic' ? '🚀 Exciting news!' :
                          aiFormData.tone === 'humorous' ? '😄 Ready for this?' :
                          aiFormData.tone === 'informative' ? 'Here are the details:' :
                          'We are pleased to announce:';
        
        contentSettings.platforms.forEach(platform => {
          mockContent.push({
            type: 'copy',
            content: `${tonePrefix} ${brandData.brand_name || formData.brand_name} presents: ${formData.title}! ${formData.description || 'Experience something amazing.'} Perfect for ${formData.target_audience || 'everyone'}. ${aiFormData.keywords ? `#${aiFormData.keywords.split(',').join(' #')}` : ''} #Innovation #Quality`,
            platform: platform
          });
        });
      }
      
      if (contentSettings.contentTypes.includes('email')) {
        const emailTone = aiFormData.tone === 'casual' ? 'Hi there!' :
                         aiFormData.tone === 'enthusiastic' ? 'We\'re thrilled to share!' :
                         'We are pleased to inform you';
        
        mockContent.push({
          type: 'email',
          content: `Subject: ${formData.title} - ${brandData.brand_name || formData.brand_name}\n\n${emailTone}\n\nWe're excited to introduce our ${formData.title} campaign.\n\n${formData.description || 'This represents our commitment to excellence and innovation.'}\n\nDesigned specifically for ${formData.target_audience || 'our valued customers'}, this campaign focuses on delivering exceptional value.\n\nKey benefits:\n• ${formData.title} showcases our latest innovations\n• Tailored for ${formData.target_audience || 'your needs'}\n• ${formData.description || 'Premium quality you can trust'}\n\nThank you for being part of our community.\n\nBest regards,\nThe ${brandData.brand_name || formData.brand_name} Team`,
          platform: 'email'
        });
      }
      
      if (contentSettings.contentTypes.includes('image')) {
        contentSettings.platforms.forEach(platform => {
          if (platform !== 'email') {
            mockContent.push({
              type: 'image',
              content: `${aiFormData.tone || 'Professional'} image for ${brandData.brand_name || formData.brand_name} ${formData.title} campaign - ${formData.description}`,
              platform: platform,
              mediaUrl: `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop`
            });
          }
        });
      }
      
      if (contentSettings.contentTypes.includes('video')) {
        contentSettings.platforms.forEach(platform => {
          if (platform !== 'email') {
            mockContent.push({
              type: 'video',
              content: `15-second ${aiFormData.tone || 'engaging'} video script for ${brandData.brand_name || formData.brand_name} ${formData.title}: Hook (0-3s) → Core message about "${formData.description}" (3-12s) → Call-to-action (12-15s).`,
              platform: platform
            });
          }
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
        setIsLoading(false);
        return;
      }

      // Create campaign first
      const campaignData: any = {
        user_id: user!.id,
        title,
        description,
        brand_name,
        target_audience,
        campaign_goals,
        budget: budget ? parseFloat(budget) : null,
        status: 'active'
      };

      // Only add dates if they are not empty strings
      if (start_date && start_date.trim() !== '') {
        campaignData.start_date = start_date;
      }
      if (end_date && end_date.trim() !== '') {
        campaignData.end_date = end_date;
      }

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single();

      if (error) throw error;

      // Generate content after campaign is created
      if (contentSettings.contentTypes.length > 0) {
        setIsGeneratingContent(true);
        
        try {
          const { data, error: genError } = await supabase.functions.invoke('generate-campaign-content', {
            body: {
              campaignData: {
                id: campaign.id,
                title: campaign.title,
                brand_name: campaign.brand_name,
                description: campaign.description,
                target_audience: campaign.target_audience,
                campaign_goals: campaign.campaign_goals
              },
              contentRequests: (() => {
                const requests = [];
                const selectedPlatforms = aiFormData.platform === 'all' 
                  ? ['facebook', 'instagram', 'linkedin', 'twitter']
                  : [aiFormData.platform || 'facebook'];
                
                // Generate content for each social platform
                selectedPlatforms.forEach(platform => {
                  requests.push({
                    platform: platform,
                    contentType: 'copy',
                    mediaType: 'text'
                  });
                  requests.push({
                    platform: platform,
                    contentType: 'image',
                    mediaType: 'image'
                  });
                  requests.push({
                    platform: platform,
                    contentType: 'video',
                    mediaType: 'video'
                  });
                });
                
                // Always add email
                requests.push({
                  platform: 'email',
                  contentType: 'email',
                  mediaType: 'text'
                });
                
                return requests;
              })(),
              aiSettings: {
                brandData: brandData,
                contentSettings: contentSettings,
                adSettings: formData.campaign_type === 'paid_ad' ? adSettings : null,
                tone: aiFormData.tone || 'professional',
                keywords: aiFormData.keywords || '',
                customImagePrompt: aiFormData.imagePrompt,
                customVideoPrompt: aiFormData.videoPrompt
              }
            }
          });

          if (genError) {
            console.error('Content generation error:', genError);
            toast({
              title: "Campaign Created",
              description: "Campaign created, but content generation had issues. You can generate content later.",
              variant: "destructive"
            });
          } else {
            console.log('Content generated successfully:', data);
            toast({
              title: "Campaign Created Successfully!",
              description: "Your campaign has been created with AI-generated content including copy, images, and videos.",
            });
          }
        } catch (contentError) {
          console.error('Error generating content:', contentError);
          toast({
            title: "Campaign Created",
            description: "Campaign created, but content generation failed. You can generate content later.",
            variant: "destructive"
          });
        } finally {
          setIsGeneratingContent(false);
        }
      } else {
        toast({
          title: "Campaign Created!",
          description: "Your campaign has been saved.",
        });
      }

      navigate(`/campaigns/${campaign.id}`);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsGeneratingContent(false);
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

  const handleCampaignTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      campaign_type: value
    }));
    // Also update aiFormData to keep them in sync
    setAiFormData(prev => ({
      ...prev,
      campaignType: value
    }));
  };

  const handleBudgetTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      budget_type: value
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
              <BrandSetupForm
                brandData={brandData}
                onChange={(field, value) => setBrandData({ ...brandData, [field]: value })}
              />

              <CampaignDetailsForm
                formData={formData}
                onChange={handleInputChange}
                onGoalsChange={handleGoalsChange}
                onCampaignTypeChange={handleCampaignTypeChange}
              />

              <ContentCreationSteps
                contentSettings={contentSettings}
                onChange={(field, value) => setContentSettings({ ...contentSettings, [field]: value })}
                onGenerate={handleGenerateContent}
                isGenerating={isGeneratingContent}
              />

              {formData.campaign_type === 'paid_ad' && (
                <>
                  <PaidAdSettings
                    adSettings={adSettings}
                    onChange={(field, value) => setAdSettings({ ...adSettings, [field]: value })}
                  />
                  <BudgetScheduleForm
                    formData={formData}
                    onChange={handleInputChange}
                    onBudgetTypeChange={handleBudgetTypeChange}
                  />
                </>
              )}
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
                Generate, Create & Save Campaign
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
