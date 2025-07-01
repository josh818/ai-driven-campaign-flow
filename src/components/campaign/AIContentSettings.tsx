
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Wand2, Sparkles } from 'lucide-react';

interface AIContentSettingsProps {
  formData: {
    target_audience: string;
  };
  aiFormData: {
    contentType: string;
    platform: string;
    tone: string;
    keywords: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAIFormChange: (field: string, value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const AIContentSettings = ({ 
  formData, 
  aiFormData, 
  onInputChange, 
  onAIFormChange, 
  onGenerate, 
  isGenerating 
}: AIContentSettingsProps) => {
  return (
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
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contentType">Content Type</Label>
          <Select value={aiFormData.contentType} onValueChange={(value) => onAIFormChange('contentType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="copy">Copy/Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="all">All Types</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <Select value={aiFormData.platform} onValueChange={(value) => onAIFormChange('platform', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Select value={aiFormData.tone} onValueChange={(value) => onAIFormChange('tone', value)}>
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
          onChange={(e) => onAIFormChange('keywords', e.target.value)}
        />
      </div>

      <Button 
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
      >
        {isGenerating ? (
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
  );
};

export default AIContentSettings;
