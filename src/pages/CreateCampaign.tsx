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
import { ArrowLeft, Wand2, Sparkles, Target, Calendar, DollarSign } from 'lucide-react';
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
            <h2 className="text-3xl font-bold text-foreground">Create New Campaign</h2>
            <p className="text-muted-foreground">Launch your next marketing campaign with professional tools</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Campaign Details */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Campaign Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Label htmlFor="campaign_type">Campaign Type</Label>
                <Select value={formData.campaign_type} onValueChange={handleCampaignTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="organic">Organic Content</SelectItem>
                    <SelectItem value="paid_ad">Paid Advertisement</SelectItem>
                    <SelectItem value="promoted">Promoted Post</SelectItem>
                  </SelectContent>
                </Select>
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
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  name="target_audience"
                  placeholder="Describe your target audience"
                  value={formData.target_audience}
                  onChange={handleInputChange}
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
            </CardContent>
          </Card>

          {/* Budget and Schedule */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>Budget & Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="0.00"
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
            </CardContent>
          </Card>

          {/* AI Content Generation Preview */}
          <Card className="shadow-lg bg-muted/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>AI Content Generation</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Professional content will be generated after campaign creation</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <div className="text-2xl mb-2">📝</div>
                  <h4 className="font-semibold text-card-foreground">Copy & Content</h4>
                  <p className="text-sm text-muted-foreground">AI-generated posts and captions</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <div className="text-2xl mb-2">🎨</div>
                  <h4 className="font-semibold text-card-foreground">Visual Assets</h4>
                  <p className="text-sm text-muted-foreground">Professional images and graphics</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <div className="text-2xl mb-2">📧</div>
                  <h4 className="font-semibold text-card-foreground">Email Content</h4>
                  <p className="text-sm text-muted-foreground">Engaging email campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
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
                Create Campaign
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;