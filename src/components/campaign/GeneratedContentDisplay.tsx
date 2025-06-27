
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, Image, Video, FileText, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedContent {
  type: 'copy' | 'image' | 'video';
  content: string;
  platform?: string;
}

interface GeneratedContentDisplayProps {
  content: GeneratedContent[];
}

const GeneratedContentDisplay = ({ content }: GeneratedContentDisplayProps) => {
  const { toast } = useToast();

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content copied to clipboard!",
    });
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'copy': return <FileText className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (content.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center">
        <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
        Generated Content
      </h3>
      {content.map((item, index) => (
        <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getContentIcon(item.type)}
              <span className="capitalize">{item.type} Content</span>
              {item.platform && (
                <span className="text-sm text-gray-600">• {item.platform}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <pre className="whitespace-pre-wrap text-sm">{item.content}</pre>
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(item.content)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button type="button" variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GeneratedContentDisplay;
