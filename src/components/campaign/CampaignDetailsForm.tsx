
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CampaignDetailsFormProps {
  formData: {
    brand_name: string;
    title: string;
    description: string;
    campaign_goals: string[];
    campaign_type?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onGoalsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCampaignTypeChange: (value: string) => void;
}

const CampaignDetailsForm = ({ formData, onChange, onGoalsChange, onCampaignTypeChange }: CampaignDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand_name">Brand Name *</Label>
          <Input
            id="brand_name"
            name="brand_name"
            placeholder="Enter your brand name"
            value={formData.brand_name}
            onChange={onChange}
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
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign_type">Campaign Type</Label>
        <Select value={formData.campaign_type || 'organic'} onValueChange={onCampaignTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select campaign type" />
          </SelectTrigger>
          <SelectContent>
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
          onChange={onChange}
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
          onChange={onGoalsChange}
        />
      </div>
    </div>
  );
};

export default CampaignDetailsForm;
