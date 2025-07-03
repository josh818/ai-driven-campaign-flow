import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, Eye, Edit3, Send, Users, BarChart3, Calendar, 
  Smartphone, Monitor, Tablet, Copy, Download, Settings,
  Palette, Type, Image, Layout, Star, Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailPreviewProps {
  content: {
    content: string;
    subject?: string;
    preheader?: string;
    mediaUrl?: string;
  };
  brandData: {
    brand_name: string;
    brand_colors: string[];
    brand_voice: string;
  };
}

const EnhancedEmailPreview = ({ content, brandData }: EmailPreviewProps) => {
  const { toast } = useToast();
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [isEditing, setIsEditing] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    template: 'modern',
    colorScheme: 'brand',
    fontSize: 16,
    includeImages: true,
    personalizedGreeting: true,
    ctaStyle: 'button',
    footerIncluded: true
  });

  const [editedContent, setEditedContent] = useState({
    subject: content.subject || extractSubject(content.content),
    preheader: content.preheader || 'Email preview text',
    body: extractBody(content.content),
    cta: 'Learn More'
  });

  function extractSubject(content: string): string {
    const subjectMatch = content.match(/Subject:\s*(.+)/);
    return subjectMatch ? subjectMatch[1].trim() : 'Campaign Update';
  }

  function extractBody(content: string): string {
    return content.replace(/^Subject:.*\n?/, '').trim();
  }

  const previewStyles = {
    desktop: { width: '600px', margin: '0 auto' },
    tablet: { width: '480px', margin: '0 auto' },
    mobile: { width: '320px', margin: '0 auto' }
  };

  const templateStyles = {
    modern: {
      container: 'bg-white rounded-lg shadow-lg overflow-hidden',
      header: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6',
      body: 'p-6 space-y-4',
      cta: 'bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700'
    },
    minimal: {
      container: 'bg-white border border-gray-200 rounded-sm overflow-hidden',
      header: 'bg-gray-50 border-b p-4',
      body: 'p-6 space-y-4',
      cta: 'border-2 border-black text-black px-6 py-2 font-medium hover:bg-black hover:text-white'
    },
    newsletter: {
      container: 'bg-white shadow-sm overflow-hidden',
      header: 'bg-white border-b-2 border-blue-600 p-4',
      body: 'p-4 space-y-3',
      cta: 'bg-green-500 text-white px-4 py-2 rounded font-medium hover:bg-green-600'
    }
  };

  const currentTemplate = templateStyles[emailSettings.template as keyof typeof templateStyles];

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Email content copied to clipboard!" });
  };

  const downloadHTML = () => {
    const htmlContent = generateEmailHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editedContent.subject.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Email HTML downloaded successfully!" });
  };

  const generateEmailHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${editedContent.subject}</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${brandData.brand_name}</h1>
        </div>
        <div style="padding: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #1f2937;">${editedContent.subject}</h2>
            <div style="line-height: 1.6; color: #374151; margin-bottom: 24px;">
                ${editedContent.body.split('\n').map(line => `<p style="margin: 0 0 12px 0;">${line}</p>`).join('')}
            </div>
            ${content.mediaUrl ? `<img src="${content.mediaUrl}" alt="Campaign visual" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 24px;">` : ''}
            <div style="text-align: center; margin: 24px 0;">
                <a href="#" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">${editedContent.cta}</a>
            </div>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${brandData.brand_name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-lg">Professional Email Preview</CardTitle>
              <p className="text-sm text-gray-600">HoppyCopy-style email creation experience</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>Live Preview</span>
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={isEditing ? 'edit' : 'preview'} className="w-full">
          <TabsList className="grid w-full grid-cols-3 m-4">
            <TabsTrigger value="preview" onClick={() => setIsEditing(false)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="edit" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Content
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Design
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="p-4">
            {/* Device Preview Controls */}
            <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Preview Device:</span>
                <Button
                  variant={previewDevice === 'desktop' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateEmailHTML())}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy HTML
                </Button>
                <Button variant="outline" size="sm" onClick={downloadHTML}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            {/* Email Preview */}
            <div className="bg-gray-100 p-6 rounded-lg">
              <div style={previewStyles[previewDevice as keyof typeof previewStyles]}>
                {/* Email Client Header */}
                <div className="bg-white border border-gray-200 rounded-t-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">📧 Email Client Preview</div>
                    <div className="text-xs text-gray-500">
                      {previewDevice === 'mobile' ? 'Mobile View' : 
                       previewDevice === 'tablet' ? 'Tablet View' : 'Desktop View'}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div><strong>From:</strong> {brandData.brand_name} &lt;hello@{brandData.brand_name.toLowerCase().replace(/\s+/g, '')}.com&gt;</div>
                    <div><strong>To:</strong> customer@email.com</div>
                    <div><strong>Subject:</strong> {editedContent.subject}</div>
                    <div className="text-gray-500">Preheader: {editedContent.preheader}</div>
                  </div>
                </div>

                {/* Email Content */}
                <div className={currentTemplate.container}>
                  <div className={currentTemplate.header}>
                    <h1 className="text-xl font-bold text-center m-0">{brandData.brand_name}</h1>
                  </div>
                  
                  <div className={currentTemplate.body}>
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">{editedContent.subject}</h2>
                    
                    <div className="text-gray-700 leading-relaxed space-y-3">
                      {editedContent.body.split('\n').map((line, index) => (
                        <p key={index} className="m-0">{line}</p>
                      ))}
                    </div>

                    {content.mediaUrl && (
                      <div className="my-6">
                        <img 
                          src={content.mediaUrl} 
                          alt="Campaign visual"
                          className="w-full h-auto rounded-lg shadow-sm"
                        />
                      </div>
                    )}

                    <div className="text-center mt-6">
                      <button className={`${currentTemplate.cta} transition-colors`}>
                        {editedContent.cta}
                      </button>
                    </div>
                  </div>

                  {emailSettings.footerIncluded && (
                    <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t">
                      <p className="mb-2">You received this email because you subscribed to our updates.</p>
                      <div className="space-x-4">
                        <a href="#" className="text-blue-600 hover:underline">Unsubscribe</a>
                        <a href="#" className="text-blue-600 hover:underline">View in browser</a>
                        <a href="#" className="text-blue-600 hover:underline">Update preferences</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Email Subject Line</Label>
                  <Input
                    id="subject"
                    value={editedContent.subject}
                    onChange={(e) => setEditedContent({ ...editedContent, subject: e.target.value })}
                    placeholder="Enter compelling subject line"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Characters: {editedContent.subject.length}/50 (optimal length)
                  </p>
                </div>

                <div>
                  <Label htmlFor="preheader">Preheader Text</Label>
                  <Input
                    id="preheader"
                    value={editedContent.preheader}
                    onChange={(e) => setEditedContent({ ...editedContent, preheader: e.target.value })}
                    placeholder="Preview text that appears after subject"
                  />
                </div>

                <div>
                  <Label htmlFor="cta">Call-to-Action Text</Label>
                  <Input
                    id="cta"
                    value={editedContent.cta}
                    onChange={(e) => setEditedContent({ ...editedContent, cta: e.target.value })}
                    placeholder="e.g., Learn More, Shop Now, Get Started"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="body">Email Body Content</Label>
                <Textarea
                  id="body"
                  value={editedContent.body}
                  onChange={(e) => setEditedContent({ ...editedContent, body: e.target.value })}
                  rows={12}
                  placeholder="Write your email content here..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pro tip: Keep paragraphs short and use bullet points for better readability
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Email Template</Label>
                  <Select 
                    value={emailSettings.template} 
                    onValueChange={(value) => setEmailSettings({ ...emailSettings, template: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern & Professional</SelectItem>
                      <SelectItem value="minimal">Clean & Minimal</SelectItem>
                      <SelectItem value="newsletter">Newsletter Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color Scheme</Label>
                  <Select 
                    value={emailSettings.colorScheme} 
                    onValueChange={(value) => setEmailSettings({ ...emailSettings, colorScheme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">Brand Colors</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="blue">Blue Theme</SelectItem>
                      <SelectItem value="green">Green Theme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Include Images</Label>
                  <Switch 
                    checked={emailSettings.includeImages}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, includeImages: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Personalized Greeting</Label>
                  <Switch 
                    checked={emailSettings.personalizedGreeting}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, personalizedGreeting: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Include Footer</Label>
                  <Switch 
                    checked={emailSettings.footerIncluded}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, footerIncluded: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedEmailPreview;