import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Wand2, Sparkles, Target, DollarSign, Calendar, Zap } from 'lucide-react';
import Header from '@/components/Header';

const CreateCampaign = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Campaign form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand_name: '',
    target_audience: '',
    campaign_goals: [] as string[],
    budget: '',
    start_date: '',
    end_date: '',
    campaign_type: 'organic'
  });

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

      // Create campaign
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

      toast({
        title: "Campaign Created!",
        description: "Your campaign has been saved successfully.",
      });

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
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Create Campaign</h1>
              <p className="text-muted-foreground mt-1">Build your next marketing campaign with AI-powered tools</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-primary">
            <Zap className="h-5 w-5" />
            <span className="font-medium">AI-Powered</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Campaign Basics */}
          <Card className="border-2 border-border shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <Target className="h-6 w-6 text-primary" />
                <span>Campaign Foundation</span>
              </CardTitle>
              <p className="text-muted-foreground text-sm">Start with the basics of your campaign</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brand_name" className="text-sm font-medium">Brand Name *</Label>
                  <Input
                    id="brand_name"
                    name="brand_name"
                    placeholder="Enter your brand name"
                    value={formData.brand_name}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Campaign Name *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter campaign name"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign_type" className="text-sm font-medium">Campaign Type</Label>
                <Select value={formData.campaign_type} onValueChange={handleCampaignTypeChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg">
                    <SelectItem value="organic">🌱 Organic Content</SelectItem>
                    <SelectItem value="paid_ad">💰 Paid Advertisement</SelectItem>
                    <SelectItem value="promoted">🚀 Promoted Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Campaign Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your campaign objectives, key messages, and goals..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="target_audience" className="text-sm font-medium">Target Audience</Label>
                  <Input
                    id="target_audience"
                    name="target_audience"
                    placeholder="Who are you trying to reach?"
                    value={formData.target_audience}
                    onChange={handleInputChange}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign_goals" className="text-sm font-medium">Campaign Goals</Label>
                  <Input
                    id="campaign_goals"
                    name="campaign_goals"
                    placeholder="brand awareness, lead generation, sales"
                    value={formData.campaign_goals.join(', ')}
                    onChange={handleGoalsChange}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget and Timeline */}
          <Card className="border-2 border-border shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <DollarSign className="h-6 w-6 text-primary" />
                <span>Budget & Timeline</span>
              </CardTitle>
              <p className="text-muted-foreground text-sm">Set your budget and campaign schedule</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium">Budget ($)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="0.00"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="h-11"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-sm font-medium">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Content Preview */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <Sparkles className="h-6 w-6 text-primary" />
                <span>AI Content Generation</span>
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Our AI will generate professional content for your campaign across multiple channels
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">📝</div>
                  <h4 className="font-semibold text-card-foreground mb-2">Social Media Posts</h4>
                  <p className="text-sm text-muted-foreground">
                    Platform-optimized posts with captions, hashtags, and engagement hooks
                  </p>
                </div>
                <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">🎨</div>
                  <h4 className="font-semibold text-card-foreground mb-2">Visual Content</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional images, graphics, and visual assets for your brand
                  </p>
                </div>
                <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">📧</div>
                  <h4 className="font-semibold text-card-foreground mb-2">Email Campaigns</h4>
                  <p className="text-sm text-muted-foreground">
                    Compelling email sequences with subject lines and CTAs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              className="h-12 px-8 text-base font-medium min-w-[200px]"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Create Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;