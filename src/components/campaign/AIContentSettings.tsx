import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Wand2, Lightbulb, Image, Video, FileText, Mail, Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface AIContentSettingsProps {
  formData: {
    target_audience: string;
    brand_name: string;
    title: string;
  };
  aiFormData: {
    contentType: string;
    platform: string;
    tone: string;
    keywords: string;
    campaignType?: string;
    imagePrompt?: string;
    videoPrompt?: string;
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toneDescriptions = {
    professional: "Formal, business-like, authoritative tone perfect for B2B and corporate communications",
    casual: "Friendly, conversational, relaxed language that feels approachable and human",
    enthusiastic: "Energetic, exciting, full of energy that gets people pumped up and engaged",
    informative: "Educational, fact-based, clear explanations that build trust through knowledge",
    humorous: "Light-hearted, funny, entertaining content that makes people smile and share"
  };

  const platformBestPractices = {
    facebook: "Engaging posts with 1-2 sentences, use emojis, encourage comments and shares",
    instagram: "Visual storytelling, lifestyle-focused, hashtag-heavy content with beautiful imagery",
    linkedin: "Professional insights, industry news, thought leadership, networking focus",
    twitter: "Concise messages under 280 chars, trending hashtags, timely and conversational",
    email: "Structured format with clear subject line, personal greeting, value-driven content"
  };

  const contentTypeGuidance = {
    copy: "Text-based social media posts optimized for engagement and sharing",
    image: "High-quality visuals that stop scrolling and communicate your brand message",
    video: "5-second dynamic content perfect for social media consumption",
    email: "Long-form content with proper structure, subject line, and call-to-action",
    all: "Complete content suite including copy, images, videos, and email templates"
  };

  return (
    <div className="border-t pt-6">
      <div className="text-center space-y-2 mb-6">
        <div className="flex items-center justify-center space-x-2">
          <Wand2 className="h-6 w-6 text-blue-600" />
          <h4 className="text-xl font-semibold">AI Content Generation</h4>
        </div>
        <p className="text-sm text-gray-600">Generate professional marketing content using AI trained by 20+ year marketing experts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Content Type Selection */}
        <div className="space-y-3">
          <Label htmlFor="contentType" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Content Type *</span>
          </Label>
          <Select 
            value={aiFormData.contentType} 
            onValueChange={(value) => onAIFormChange('contentType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose content types to generate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center space-x-2">
                  <Wand2 className="h-4 w-4" />
                  <span>All Content Types</span>
                </div>
              </SelectItem>
              <SelectItem value="copy">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Social Media Copy</span>
                </div>
              </SelectItem>
              <SelectItem value="image">
                <div className="flex items-center space-x-2">
                  <Image className="h-4 w-4" />
                  <span>AI-Generated Images</span>
                </div>
              </SelectItem>
              <SelectItem value="video">
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>5-Second Videos</span>
                </div>
              </SelectItem>
              <SelectItem value="email">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Marketing</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {aiFormData.contentType && (
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <Lightbulb className="h-4 w-4 inline mr-1" />
              {contentTypeGuidance[aiFormData.contentType as keyof typeof contentTypeGuidance]}
            </div>
          )}
        </div>

        {/* Platform Selection */}
        <div className="space-y-3">
          <Label htmlFor="platform" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Primary Platform *</span>
          </Label>
          <Select 
            value={aiFormData.platform || 'all'} 
            onValueChange={(value) => onAIFormChange('platform', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌐 All Platforms</SelectItem>
              <SelectItem value="facebook">📘 Facebook</SelectItem>
              <SelectItem value="instagram">📸 Instagram</SelectItem>
              <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
              <SelectItem value="twitter">🐦 Twitter/X</SelectItem>
              <SelectItem value="email">📧 Email Marketing</SelectItem>
            </SelectContent>
          </Select>
          {aiFormData.platform && (
            <div className="p-3 bg-green-50 rounded-lg text-xs text-green-700">
              💡 {platformBestPractices[aiFormData.platform as keyof typeof platformBestPractices]}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <Label htmlFor="target_audience">Target Audience</Label>
          <Input
            id="target_audience"
            name="target_audience"
            placeholder="e.g., young professionals, families, decision makers"
            value={formData.target_audience}
            onChange={onInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Brand Tone</Label>
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
          {aiFormData.tone && (
            <div className="p-2 bg-purple-50 rounded text-xs text-purple-700">
              <strong>{aiFormData.tone}:</strong> {toneDescriptions[aiFormData.tone as keyof typeof toneDescriptions]?.split(',')[0]}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <Label htmlFor="keywords">SEO Keywords & Hashtags</Label>
        <Input
          id="keywords"
          placeholder="innovation, quality, trusted, premium (comma-separated)"
          value={aiFormData.keywords}
          onChange={(e) => onAIFormChange('keywords', e.target.value)}
        />
        <p className="text-xs text-gray-500">
          💡 These keywords will be naturally incorporated into your content and used for hashtags
        </p>
      </div>

      {/* Advanced Settings - Now Always Visible */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Wand2 className="h-5 w-5 text-purple-600" />
          <h5 className="text-lg font-semibold">Custom AI Prompts</h5>
        </div>

        <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="space-y-3">
              <Label htmlFor="imagePrompt" className="flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Custom Image Generation Prompt</span>
              </Label>
              <Textarea
                name="imagePrompt"
                placeholder="Describe the visual style: modern office setting, vibrant colors, professional people, product close-up, lifestyle scene..."
                value={aiFormData.imagePrompt || ''}
                onChange={(e) => onAIFormChange('imagePrompt', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500">
                🎨 <strong>Pro tip:</strong> Describe lighting (natural, studio, golden hour), mood (energetic, calm, professional), composition (close-up, wide shot), and style (modern, minimalist, vibrant)
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="videoPrompt" className="flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Custom Video Generation Prompt</span>
              </Label>
              <Textarea
                name="videoPrompt"
                placeholder="Describe the 5-second video concept: smooth camera movement, product showcase, lifestyle scene, dynamic transitions..."
                value={aiFormData.videoPrompt || ''}
                onChange={(e) => onAIFormChange('videoPrompt', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500">
                🎬 <strong>Pro tip:</strong> Think cinematically - describe camera movements (pan, zoom, dolly), pacing (fast, slow, dynamic), and visual elements (product focus, people interaction, environment)
              </p>
            </div>
          </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border mb-6">
        <h5 className="font-semibold text-sm mb-2 flex items-center">
          <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
          Pro Tips for Better AI Content
        </h5>
        <div className="text-xs space-y-1 text-gray-600">
          <p>• <strong>Campaign Description:</strong> Be specific about your value proposition and unique selling points</p>
          <p>• <strong>Target Audience:</strong> Include demographics, interests, pain points, and motivations</p>
          <p>• <strong>Keywords:</strong> Mix brand terms with industry keywords for better SEO and discoverability</p>
          <p>• <strong>Images:</strong> Describe lighting, mood, composition, and visual style for better results</p>
          <p>• <strong>Videos:</strong> Think about camera angles, movement, pacing, and storytelling in 5 seconds</p>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || !formData.brand_name || !formData.title || !aiFormData.contentType}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg"
      >
        {isGenerating ? (
          <>
            <Wand2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Professional Content...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-5 w-5" />
            Generate AI Content
          </>
        )}
      </Button>

      {!formData.brand_name || !formData.title || !aiFormData.contentType ? (
        <p className="text-xs text-gray-500 text-center mt-2">
          Please fill in Brand Name, Campaign Title, and Content Type to generate content
        </p>
      ) : null}
    </div>
  );
};

export default AIContentSettings;