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
import { Slider } from '@/components/ui/slider';
import { 
  Facebook, Instagram, Linkedin, Twitter, 
  Copy, Download, Edit3, Eye, Settings, Calendar, 
  Heart, MessageCircle, Share, BarChart3, 
  Hash, Users, Target, Clock, Zap, Play,
  Image as ImageIcon, Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialPreviewProps {
  content: {
    content: string;
    platform: string;
    mediaUrl?: string;
    mediaType?: string;
  };
  brandData: {
    brand_name: string;
    brand_colors: string[];
    brand_voice: string;
  };
}

const EnhancedSocialPreview = ({ content, brandData }: SocialPreviewProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [postSettings, setPostSettings] = useState({
    autoHashtags: true,
    bestTimePosting: true,
    crossPlatformOptimize: true,
    audienceTargeting: false,
    scheduledTime: '',
    postTone: 'brand-voice',
    includeEmojis: true,
    ctaIncluded: true
  });

  const [editedContent, setEditedContent] = useState({
    text: cleanContent(content.content),
    hashtags: extractHashtags(content.content),
    customHashtags: [] as string[],
    cta: 'Learn more →',
    scheduledFor: '',
    targetAudience: 'all'
  });

  const [newHashtag, setNewHashtag] = useState('');

  function cleanContent(text: string): string {
    return text.replace(/^(Brand:|Campaign:|CAMPAIGN:).*\n/gm, '').replace(/#\w+/g, '').trim();
  }

  function extractHashtags(text: string): string[] {
    const hashtagMatches = text.match(/#\w+/g);
    return hashtagMatches ? hashtagMatches.map(tag => tag.substring(1)) : [];
  }

  const platformSpecs = {
    facebook: {
      name: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      maxChars: 63206,
      optimalChars: 80,
      color: '#1877f2',
      features: ['reactions', 'comments', 'shares', 'boost'],
      aspectRatio: '16:9'
    },
    instagram: {
      name: 'Instagram',
      icon: <Instagram className="h-4 w-4" />,
      maxChars: 2200,
      optimalChars: 125,
      color: '#E4405F',
      features: ['likes', 'comments', 'shares', 'saves'],
      aspectRatio: '1:1'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      maxChars: 3000,
      optimalChars: 150,
      color: '#0A66C2',
      features: ['reactions', 'comments', 'shares', 'saves'],
      aspectRatio: '16:9'
    },
    twitter: {
      name: 'Twitter/X',
      icon: <Twitter className="h-4 w-4" />,
      maxChars: 280,
      optimalChars: 100,
      color: '#000000',
      features: ['likes', 'retweets', 'replies', 'bookmarks'],
      aspectRatio: '16:9'
    }
  };

  const currentPlatform = platformSpecs[content.platform as keyof typeof platformSpecs] || platformSpecs.facebook;

  const addHashtag = () => {
    if (newHashtag.trim() && !editedContent.customHashtags.includes(newHashtag.trim())) {
      setEditedContent({
        ...editedContent,
        customHashtags: [...editedContent.customHashtags, newHashtag.trim()]
      });
      setNewHashtag('');
    }
  };

  const removeHashtag = (hashtag: string, isCustom: boolean = false) => {
    if (isCustom) {
      setEditedContent({
        ...editedContent,
        customHashtags: editedContent.customHashtags.filter(tag => tag !== hashtag)
      });
    } else {
      setEditedContent({
        ...editedContent,
        hashtags: editedContent.hashtags.filter(tag => tag !== hashtag)
      });
    }
  };

  const getAllHashtags = () => [...editedContent.hashtags, ...editedContent.customHashtags];

  const getPostText = () => {
    const allHashtags = getAllHashtags();
    const hashtagString = allHashtags.length > 0 ? '\n\n' + allHashtags.map(tag => `#${tag}`).join(' ') : '';
    return editedContent.text + hashtagString;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getPostText());
    toast({ title: "Copied", description: "Post content copied to clipboard!" });
  };

  const renderPlatformPreview = () => {
    const platform = content.platform?.toLowerCase();
    const postText = getPostText();
    
    const platformStyles = {
      instagram: {
        container: "bg-white border border-gray-200 rounded-lg max-w-sm mx-auto shadow-lg",
        header: "flex items-center p-3 border-b border-gray-100",
        avatar: "w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold",
        username: "ml-2 font-medium text-sm",
        image: "w-full aspect-square object-cover",
        content: "p-3 text-sm leading-relaxed",
        actions: "flex justify-between items-center px-3 pb-3"
      },
      linkedin: {
        container: "bg-white border border-gray-300 rounded-lg max-w-lg shadow-lg",
        header: "flex items-center p-4 border-b border-gray-100",
        avatar: "w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold",
        username: "ml-3 font-medium text-base",
        image: "w-full max-h-80 object-cover",
        content: "p-4 text-sm leading-relaxed text-gray-800",
        actions: "flex justify-between items-center px-4 pb-4 text-blue-600"
      },
      facebook: {
        container: "bg-white border border-gray-300 rounded-lg max-w-lg shadow-lg",
        header: "flex items-center p-3",
        avatar: "w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold",
        username: "ml-2 font-medium text-base",
        image: "w-full max-h-80 object-cover",
        content: "p-3 text-sm leading-relaxed",
        actions: "flex justify-between items-center px-3 pb-3 text-gray-600"
      },
      twitter: {
        container: "bg-white border border-gray-200 rounded-xl max-w-lg p-3 shadow-lg",
        header: "flex items-center mb-2",
        avatar: "w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold",
        username: "ml-2 font-bold text-sm",
        image: "w-full max-h-60 object-cover rounded-xl mt-2",
        content: "text-sm leading-relaxed",
        actions: "flex justify-between items-center mt-3 text-gray-500"
      }
    };

    const style = platformStyles[platform as keyof typeof platformStyles] || platformStyles.facebook;
    const brandInitials = brandData.brand_name.charAt(0).toUpperCase();

    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <div className={style.container}>
          {/* Header */}
          <div className={style.header}>
            <div className={style.avatar} style={{ backgroundColor: currentPlatform.color }}>
              {brandInitials}
            </div>
            <div className={style.username}>
              <div className="font-semibold">{brandData.brand_name}</div>
              {platform === 'twitter' && <div className="text-gray-500 text-xs">@{brandData.brand_name.toLowerCase().replace(/\s+/g, '')}</div>}
              {platform === 'linkedin' && <div className="text-xs text-gray-500">Company • Sponsored</div>}
              {platform === 'facebook' && <div className="text-xs text-gray-500">2h • 🌐</div>}
              {platform === 'instagram' && <div className="text-xs text-gray-500">2 hours ago</div>}
            </div>
          </div>
          
          {/* Content */}
          <div className={style.content}>
            <div className="whitespace-pre-wrap">
              {editedContent.text}
            </div>
            {getAllHashtags().length > 0 && (
              <div className="mt-2 text-blue-600">
                {getAllHashtags().map(tag => `#${tag}`).join(' ')}
              </div>
            )}
          </div>
          
          {/* Media */}
          {content.mediaUrl && (
            <div className="px-0">
              {content.mediaType === 'video' ? (
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video 
                    controls 
                    className={style.image}
                    poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFJIFZpZGVvPC90ZXh0Pgo8L3N2Zz4="
                  >
                    <source src={content.mediaUrl} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="h-12 w-12 text-white opacity-70" />
                  </div>
                </div>
              ) : (
                <img 
                  src={content.mediaUrl} 
                  alt="Generated content"
                  className={style.image}
                />
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className={style.actions}>
            <div className="flex space-x-4 text-sm">
              {platform === 'instagram' && (
                <>
                  <Heart className="h-5 w-5" />
                  <MessageCircle className="h-5 w-5" />
                  <Share className="h-5 w-5" />
                </>
              )}
              {platform === 'linkedin' && (
                <>
                  <div className="flex items-center space-x-1"><Heart className="h-4 w-4" /><span>Like</span></div>
                  <div className="flex items-center space-x-1"><MessageCircle className="h-4 w-4" /><span>Comment</span></div>
                  <div className="flex items-center space-x-1"><Share className="h-4 w-4" /><span>Share</span></div>
                </>
              )}
              {platform === 'facebook' && (
                <>
                  <div className="flex items-center space-x-1"><Heart className="h-4 w-4" /><span>Like</span></div>
                  <div className="flex items-center space-x-1"><MessageCircle className="h-4 w-4" /><span>Comment</span></div>
                  <div className="flex items-center space-x-1"><Share className="h-4 w-4" /><span>Share</span></div>
                </>
              )}
              {platform === 'twitter' && (
                <>
                  <MessageCircle className="h-4 w-4" />
                  <Share className="h-4 w-4" />
                  <Heart className="h-4 w-4" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b" style={{ backgroundColor: `${currentPlatform.color}15` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div style={{ color: currentPlatform.color }}>
              {currentPlatform.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{currentPlatform.name} Post Preview</CardTitle>
              <p className="text-sm text-gray-600">Ocoya-style social media creation experience</p>
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
            <TabsTrigger value="optimize">
              <Zap className="h-4 w-4 mr-2" />
              Optimize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="p-4">
            {/* Platform Stats */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span style={{ color: currentPlatform.color }}>{currentPlatform.icon}</span>
                  <span className="font-medium">{currentPlatform.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Character count: {getPostText().length}/{currentPlatform.maxChars}
                  <span className={getPostText().length > currentPlatform.optimalChars ? 'text-orange-500 ml-2' : 'text-green-500 ml-2'}>
                    (Optimal: {currentPlatform.optimalChars})
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </div>

            {renderPlatformPreview()}
          </TabsContent>

          <TabsContent value="edit" className="p-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="postText">Post Content</Label>
                  <Textarea
                    id="postText"
                    value={editedContent.text}
                    onChange={(e) => setEditedContent({ ...editedContent, text: e.target.value })}
                    rows={6}
                    placeholder="Write your post content here..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editedContent.text.length}/{currentPlatform.maxChars} characters
                  </p>
                </div>

                <div>
                  <Label>Hashtags</Label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add hashtag (without #)"
                        value={newHashtag}
                        onChange={(e) => setNewHashtag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addHashtag}>
                        <Hash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* AI-generated hashtags */}
                    {editedContent.hashtags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">AI-suggested hashtags:</p>
                        <div className="flex flex-wrap gap-2">
                          {editedContent.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                              <Hash className="h-3 w-3" />
                              <span>{tag}</span>
                              <button onClick={() => removeHashtag(tag)} className="text-red-500 hover:text-red-700">×</button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Custom hashtags */}
                    {editedContent.customHashtags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Custom hashtags:</p>
                        <div className="flex flex-wrap gap-2">
                          {editedContent.customHashtags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="flex items-center space-x-1">
                              <Hash className="h-3 w-3" />
                              <span>{tag}</span>
                              <button onClick={() => removeHashtag(tag, true)} className="text-red-500 hover:text-red-700">×</button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Scheduling</Label>
                  <Input
                    type="datetime-local"
                    value={editedContent.scheduledFor}
                    onChange={(e) => setEditedContent({ ...editedContent, scheduledFor: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Target Audience</Label>
                  <Select 
                    value={editedContent.targetAudience} 
                    onValueChange={(value) => setEditedContent({ ...editedContent, targetAudience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Followers</SelectItem>
                      <SelectItem value="engaged">Engaged Audience</SelectItem>
                      <SelectItem value="new">New Followers</SelectItem>
                      <SelectItem value="custom">Custom Audience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimize" className="p-4 space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Auto Hashtags</h4>
                      <p className="text-sm text-gray-600">AI-powered hashtag suggestions</p>
                    </div>
                    <Switch 
                      checked={postSettings.autoHashtags}
                      onCheckedChange={(checked) => setPostSettings({ ...postSettings, autoHashtags: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Best Time Posting</h4>
                      <p className="text-sm text-gray-600">Schedule at optimal times</p>
                    </div>
                    <Switch 
                      checked={postSettings.bestTimePosting}
                      onCheckedChange={(checked) => setPostSettings({ ...postSettings, bestTimePosting: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Cross-Platform Optimize</h4>
                      <p className="text-sm text-gray-600">Adapt content for each platform</p>
                    </div>
                    <Switch 
                      checked={postSettings.crossPlatformOptimize}
                      onCheckedChange={(checked) => setPostSettings({ ...postSettings, crossPlatformOptimize: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Performance Prediction</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Engagement Score</span>
                        <span className="font-medium text-green-600">8.5/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Reach Potential</span>
                        <span className="font-medium text-blue-600">High</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Best Time to Post</span>
                        <span className="font-medium">2:00 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Optimization Tips</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Add 2-3 more relevant hashtags</li>
                      <li>• Include a clear call-to-action</li>
                      <li>• Post during peak engagement hours</li>
                      <li>• Consider adding an emoji for personality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedSocialPreview;