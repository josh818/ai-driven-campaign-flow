
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Target, Calendar, DollarSign } from 'lucide-react';
import Header from '@/components/Header';

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  
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

  const [generatedContent, setGeneratedContent] = useState({
    copy: '',
    socialPosts: [] as string[],
    emailContent: ''
  });

  const campaignGoals = [
    'Brand Awareness',
    'Lead Generation',
    'Sales Conversion',
    'Customer Retention',
    'Social Media Engagement',
    'Website Traffic'
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      campaign_goals: prev.campaign_goals.includes(goal)
        ? prev.campaign_goals.filter(g => g !== goal)
        : [...prev.campaign_goals, goal]
    }));
  };

  const generateAIContent = async () => {
    if (!formData.brand_name || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in brand name and description to generate AI content.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingContent(true);
    try {
      // Mock AI content generation - in production, you'd call OpenAI API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedContent({
        copy: `Discover the power of ${formData.brand_name}! ${formData.description} Join thousands of satisfied customers who have transformed their experience with our innovative solutions.`,
        socialPosts: [
          `🚀 Exciting news from ${formData.brand_name}! ${formData.description} #Innovation #${formData.brand_name.replace(/\s+/g, '')}`,
          `Ready to level up? ${formData.brand_name} is here to help! ${formData.description} 💪 #Success`,
          `Don't miss out! ${formData.brand_name} brings you ${formData.description} ✨ #Opportunity`
        ],
        emailContent: `Subject: Transform Your Experience with ${formData.brand_name}\n\nDear Valued Customer,\n\n${formData.description}\n\nDiscover how ${formData.brand_name} can help you achieve your goals.\n\nBest regards,\nThe ${formData.brand_name} Team`
      });

      toast({
        title: "Content Generated!",
        description: "AI has generated campaign content for you.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          brand_name: formData.brand_name,
          target_audience: formData.target_audience,
          campaign_goals: formData.campaign_goals,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          status: 'draft'
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Create AI-generated content if available
      if (generatedContent.copy && campaign) {
        const contentInserts = [
          {
            campaign_id: campaign.id,
            content_type: 'copy',
            content_text: generatedContent.copy,
            status: 'draft'
          },
          {
            campaign_id: campaign.id,
            content_type: 'email',
            content_text: generatedContent.emailContent,
            status: 'draft'
          },
          ...generatedContent.socialPosts.map(post => ({
            campaign_id: campaign.id,
            content_type: 'social_post',
            content_text: post,
            status: 'draft'
          }))
        ];

        const { error: contentError } = await supabase
          .from('campaign_content')
          .insert(contentInserts);

        if (contentError) throw contentError;
      }

      toast({
        title: "Campaign Created!",
        description: "Your campaign has been created successfully.",
      });

      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h2>
          <p className="text-gray-600">Design your marketing campaign with AI-powered content generation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Campaign Details */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter campaign title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brand_name">Brand Name</Label>
                  <Input
                    id="brand_name"
                    value={formData.brand_name}
                    onChange={(e) => handleInputChange('brand_name', e.target.value)}
                    placeholder="Enter your brand name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your campaign objectives and key message"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Input
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    placeholder="e.g., Small business owners aged 25-45"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Campaign Goals & Budget */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Goals & Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Campaign Goals</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {campaignGoals.map(goal => (
                      <Button
                        key={goal}
                        type="button"
                        variant={formData.campaign_goals.includes(goal) ? "default" : "outline"}
                        className="justify-start text-sm"
                        onClick={() => handleGoalToggle(goal)}
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="Enter campaign budget"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Content Generation */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Content Generation
              </CardTitle>
              <CardDescription>
                Generate marketing copy, social media posts, and email content using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                onClick={generateAIContent}
                disabled={isGeneratingContent}
                className="mb-4"
              >
                {isGeneratingContent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Content
                  </>
                )}
              </Button>

              {generatedContent.copy && (
                <div className="space-y-4">
                  <div>
                    <Label>Generated Marketing Copy</Label>
                    <Textarea
                      value={generatedContent.copy}
                      onChange={(e) => setGeneratedContent(prev => ({ ...prev, copy: e.target.value }))}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Social Media Posts</Label>
                    {generatedContent.socialPosts.map((post, index) => (
                      <Textarea
                        key={index}
                        value={post}
                        onChange={(e) => {
                          const newPosts = [...generatedContent.socialPosts];
                          newPosts[index] = e.target.value;
                          setGeneratedContent(prev => ({ ...prev, socialPosts: newPosts }));
                        }}
                        rows={2}
                        className="mt-1 mb-2"
                      />
                    ))}
                  </div>
                  <div>
                    <Label>Email Content</Label>
                    <Textarea
                      value={generatedContent.emailContent}
                      onChange={(e) => setGeneratedContent(prev => ({ ...prev, emailContent: e.target.value }))}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
