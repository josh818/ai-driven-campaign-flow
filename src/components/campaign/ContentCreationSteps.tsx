import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Facebook, Instagram, Linkedin, Twitter, Mail, 
  Calendar, Clock, Palette, Type, Image, Video,
  Target, Zap, Eye, Plus, X
} from 'lucide-react';

interface ContentCreationStepsProps {
  contentSettings: {
    platforms: string[];
    contentTypes: string[];
    scheduling: {
      autoSchedule: boolean;
      timeSlots: string[];
      frequency: string;
    };
    visualStyle: {
      template: string;
      colorScheme: string;
      fontSize: number;
      fontStyle: string;
    };
    optimization: {
      audienceTargeting: boolean;
      hashtagSuggestions: boolean;
      bestTimePosting: boolean;
    };
  };
  onChange: (field: string, value: any) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ContentCreationSteps = ({ 
  contentSettings, 
  onChange, 
  onGenerate, 
  isGenerating 
}: ContentCreationStepsProps) => {
  const [newTimeSlot, setNewTimeSlot] = useState('');

  const platformIcons = {
    facebook: <Facebook className="h-4 w-4" />,
    instagram: <Instagram className="h-4 w-4" />,
    linkedin: <Linkedin className="h-4 w-4" />,
    twitter: <Twitter className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />
  };

  const togglePlatform = (platform: string) => {
    const current = contentSettings.platforms;
    const updated = current.includes(platform) 
      ? current.filter(p => p !== platform)
      : [...current, platform];
    onChange('platforms', updated);
  };

  const toggleContentType = (type: string) => {
    const current = contentSettings.contentTypes;
    const updated = current.includes(type) 
      ? current.filter(t => t !== type)
      : [...current, type];
    onChange('contentTypes', updated);
  };

  const addTimeSlot = () => {
    if (newTimeSlot.trim()) {
      const current = contentSettings.scheduling.timeSlots;
      onChange('scheduling', {
        ...contentSettings.scheduling,
        timeSlots: [...current, newTimeSlot.trim()]
      });
      setNewTimeSlot('');
    }
  };

  const removeTimeSlot = (index: number) => {
    const current = contentSettings.scheduling.timeSlots;
    onChange('scheduling', {
      ...contentSettings.scheduling,
      timeSlots: current.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>Advanced Content Creation</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Configure platform-specific settings and content optimization</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="platforms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="content">Content Types</TabsTrigger>
            <TabsTrigger value="design">Visual Design</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Target Platforms</Label>
              <p className="text-sm text-gray-600 mb-4">Choose platforms for content generation and optimization</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(platformIcons).map(([platform, icon]) => (
                  <Button
                    key={platform}
                    type="button"
                    variant={contentSettings.platforms.includes(platform) ? "default" : "outline"}
                    className="flex flex-col items-center space-y-2 p-4 h-auto"
                    onClick={() => togglePlatform(platform)}
                  >
                    {icon}
                    <span className="capitalize text-xs">{platform}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Platform-specific settings */}
            {contentSettings.platforms.length > 0 && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium">Platform-Specific Settings</h4>
                {contentSettings.platforms.map(platform => (
                  <div key={platform} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center space-x-2">
                      {platformIcons[platform as keyof typeof platformIcons]}
                      <span className="capitalize font-medium">{platform}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-xs text-gray-600">Auto-optimize</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Content Types to Generate</Label>
              <p className="text-sm text-gray-600 mb-4">Select what types of content to create</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'copy', icon: <Type className="h-4 w-4" />, label: 'Copy Text' },
                  { type: 'image', icon: <Image className="h-4 w-4" />, label: 'Images' },
                  { type: 'video', icon: <Video className="h-4 w-4" />, label: 'Videos' },
                  { type: 'email', icon: <Mail className="h-4 w-4" />, label: 'Email' }
                ].map(({ type, icon, label }) => (
                  <Button
                    key={type}
                    type="button"
                    variant={contentSettings.contentTypes.includes(type) ? "default" : "outline"}
                    className="flex flex-col items-center space-y-2 p-4 h-auto"
                    onClick={() => toggleContentType(type)}
                  >
                    {icon}
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Visual Template</Label>
                <Select 
                  value={contentSettings.visualStyle.template} 
                  onValueChange={(value) => onChange('visualStyle', { ...contentSettings.visualStyle, template: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern & Clean</SelectItem>
                    <SelectItem value="bold">Bold & Dynamic</SelectItem>
                    <SelectItem value="minimal">Minimal & Elegant</SelectItem>
                    <SelectItem value="vibrant">Vibrant & Colorful</SelectItem>
                    <SelectItem value="professional">Professional & Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Color Scheme</Label>
                <Select 
                  value={contentSettings.visualStyle.colorScheme} 
                  onValueChange={(value) => onChange('visualStyle', { ...contentSettings.visualStyle, colorScheme: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand">Use Brand Colors</SelectItem>
                    <SelectItem value="monochrome">Monochrome</SelectItem>
                    <SelectItem value="warm">Warm Tones</SelectItem>
                    <SelectItem value="cool">Cool Tones</SelectItem>
                    <SelectItem value="high-contrast">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Font Size: {contentSettings.visualStyle.fontSize}px</Label>
                <Slider
                  value={[contentSettings.visualStyle.fontSize]}
                  onValueChange={([value]) => onChange('visualStyle', { ...contentSettings.visualStyle, fontSize: value })}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Font Style</Label>
                <Select 
                  value={contentSettings.visualStyle.fontStyle} 
                  onValueChange={(value) => onChange('visualStyle', { ...contentSettings.visualStyle, fontStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sans-serif">Sans Serif (Modern)</SelectItem>
                    <SelectItem value="serif">Serif (Traditional)</SelectItem>
                    <SelectItem value="display">Display (Bold)</SelectItem>
                    <SelectItem value="handwritten">Handwritten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Audience Targeting</h4>
                  <p className="text-sm text-gray-600">Optimize content for specific audience segments</p>
                </div>
                <Switch 
                  checked={contentSettings.optimization.audienceTargeting}
                  onCheckedChange={(checked) => onChange('optimization', { 
                    ...contentSettings.optimization, 
                    audienceTargeting: checked 
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Smart Hashtag Suggestions</h4>
                  <p className="text-sm text-gray-600">AI-powered hashtag recommendations</p>
                </div>
                <Switch 
                  checked={contentSettings.optimization.hashtagSuggestions}
                  onCheckedChange={(checked) => onChange('optimization', { 
                    ...contentSettings.optimization, 
                    hashtagSuggestions: checked 
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Best Time Posting</h4>
                  <p className="text-sm text-gray-600">Schedule content at optimal times</p>
                </div>
                <Switch 
                  checked={contentSettings.optimization.bestTimePosting}
                  onCheckedChange={(checked) => onChange('optimization', { 
                    ...contentSettings.optimization, 
                    bestTimePosting: checked 
                  })}
                />
              </div>

              {/* Posting Schedule */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Preferred Posting Times</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., 9:00 AM, 2:00 PM, 6:00 PM"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTimeSlot()}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contentSettings.scheduling.timeSlots.map((time, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{time}</span>
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTimeSlot(index)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-6 border-t">
          <Button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || contentSettings.platforms.length === 0 || contentSettings.contentTypes.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg"
          >
            {isGenerating ? (
              <>
                <Zap className="mr-2 h-5 w-5 animate-spin" />
                Creating Optimized Content...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Generate Professional Content
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCreationSteps;