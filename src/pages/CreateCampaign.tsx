import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Wand2, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import AIContentGenerator from '@/components/AIContentGenerator';

const CreateCampaign = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
        description: "Now generating content for all platforms...",
      });

      // Automatically generate content for all platforms
      await generateCampaignContent(data.id);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
            <h2 className="text-3xl font-bold text-gray-900">Create New Campaign</h2>
            <p className="text-gray-600">Set up your marketing campaign with AI-powered content generation</p>
          </div>
        </div>

        {isGeneratingContent && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-100 to-pink-100 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                <div>
                  <p className="font-medium text-purple-900">Generating content across all platforms...</p>
                  <p className="text-sm text-purple-700">Creating images, copy, and videos for organic posts, paid ads, and emails</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Campaign Details</TabsTrigger>
            <TabsTrigger value="ai-content">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter campaign title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter campaign description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand_name">Brand Name</Label>
                    <Input
                      id="brand_name"
                      name="brand_name"
                      placeholder="Enter brand name"
                      value={formData.brand_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Input
                      id="target_audience"
                      name="target_audience"
                      placeholder="Enter target audience"
                      value={formData.target_audience}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign_goals">Campaign Goals (comma-separated)</Label>
                    <Input
                      id="campaign_goals"
                      name="campaign_goals"
                      placeholder="Enter campaign goals"
                      value={formData.campaign_goals.join(', ')}
                      onChange={handleGoalsChange}
                    />
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium text-purple-900">AI Content Generation</h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      When you create this campaign, AI will automatically generate content for:
                    </p>
                    <ul className="text-sm text-purple-700 mt-2 ml-4 space-y-1">
                      <li>• Organic posts, paid ads, and email content</li>
                      <li>• Facebook, Instagram, LinkedIn, X, Mailchimp, and Klaviyo</li>
                      <li>• Copy, images, and video concepts</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={isLoading || isGeneratingContent}
                  >
                    {isLoading ? (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-spin" />
                        Creating Campaign...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Campaign & Generate Content
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-content">
            <AIContentGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateCampaign;
