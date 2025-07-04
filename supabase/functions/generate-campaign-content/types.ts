
export interface CampaignData {
  id: string;
  title: string;
  brand_name: string;
  description?: string;
  target_audience?: string;
  campaign_goals?: string[];
}

export interface AISettings {
  brandData?: any;
  contentSettings?: any;
  adSettings?: any;
  platform?: string;
  contentType?: string;
  tone?: string;
  keywords?: string;
  customImagePrompt?: string;
  customVideoPrompt?: string;
}

export interface GeneratedContent {
  platform: string;
  content_type: string;
  media_type: string;
  content: string;
  has_media: boolean;
  media_url?: string;
  status?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
}
