import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Plus, X, Users, Building, Target, Palette } from 'lucide-react';

interface BrandSetupFormProps {
  brandData: {
    brand_name: string;
    brand_voice: string;
    brand_values: string[];
    target_demographics: string;
    brand_colors: string[];
    competitors: string[];
    unique_selling_points: string[];
  };
  onChange: (field: string, value: any) => void;
}

const BrandSetupForm = ({ brandData, onChange }: BrandSetupFormProps) => {
  const [newValue, setNewValue] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newUSP, setNewUSP] = useState('');

  const addItem = (field: string, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = brandData[field as keyof typeof brandData] as string[];
      onChange(field, [...currentArray, value.trim()]);
      setter('');
    }
  };

  const removeItem = (field: string, index: number) => {
    const currentArray = brandData[field as keyof typeof brandData] as string[];
    onChange(field, currentArray.filter((_, i) => i !== index));
  };

  const voiceOptions = [
    'Professional & Authoritative',
    'Friendly & Conversational', 
    'Bold & Confident',
    'Warm & Empathetic',
    'Innovative & Forward-thinking',
    'Trustworthy & Reliable',
    'Playful & Creative',
    'Sophisticated & Premium'
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>Brand Brain Setup</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Create a comprehensive brand profile for better AI content generation</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Brand Voice */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Brand Voice & Personality</span>
          </Label>
          <Select value={brandData.brand_voice} onValueChange={(value) => onChange('brand_voice', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your brand voice" />
            </SelectTrigger>
            <SelectContent>
              {voiceOptions.map((voice) => (
                <SelectItem key={voice} value={voice}>{voice}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Demographics */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Target Demographics</span>
          </Label>
          <Textarea
            placeholder="Describe your ideal customers: age, interests, profession, pain points, goals..."
            value={brandData.target_demographics}
            onChange={(e) => onChange('target_demographics', e.target.value)}
            rows={3}
          />
        </div>

        {/* Brand Values */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Brand Values</span>
          </Label>
          <div className="flex space-x-2">
            <Input
              placeholder="Add a brand value (e.g., Innovation, Quality, Trust)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('brand_values', newValue, setNewValue)}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => addItem('brand_values', newValue, setNewValue)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandData.brand_values.map((value, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{value}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeItem('brand_values', index)} 
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Brand Colors */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Brand Colors</span>
          </Label>
          <div className="flex space-x-2">
            <Input
              placeholder="Add brand color (e.g., Blue, #3B82F6, Navy)"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('brand_colors', newColor, setNewColor)}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => addItem('brand_colors', newColor, setNewColor)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandData.brand_colors.map((color, index) => (
              <Badge key={index} variant="outline" className="flex items-center space-x-1">
                <span>{color}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeItem('brand_colors', index)} 
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Competitors */}
        <div className="space-y-3">
          <Label>Key Competitors</Label>
          <div className="flex space-x-2">
            <Input
              placeholder="Add competitor name"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('competitors', newCompetitor, setNewCompetitor)}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => addItem('competitors', newCompetitor, setNewCompetitor)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandData.competitors.map((competitor, index) => (
              <Badge key={index} variant="destructive" className="flex items-center space-x-1">
                <span>{competitor}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeItem('competitors', index)} 
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Unique Selling Points */}
        <div className="space-y-3">
          <Label>Unique Selling Points</Label>
          <div className="flex space-x-2">
            <Input
              placeholder="What makes you different? (e.g., 24/7 support, patented technology)"
              value={newUSP}
              onChange={(e) => setNewUSP(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem('unique_selling_points', newUSP, setNewUSP)}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => addItem('unique_selling_points', newUSP, setNewUSP)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandData.unique_selling_points.map((usp, index) => (
              <Badge key={index} variant="default" className="flex items-center space-x-1">
                <span>{usp}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeItem('unique_selling_points', index)} 
                />
              </Badge>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default BrandSetupForm;