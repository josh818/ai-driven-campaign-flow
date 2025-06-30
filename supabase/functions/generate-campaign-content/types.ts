
export interface CampaignData {
  title: string;
  brand_name: string;
  description?: string;
  target_audience?: string;
  campaign_goals?: string[];
}

export interface AISettings {
  platform?: string;
  contentType?: string;
  tone?: string;
  keywords?: string;
}

export interface GeneratedContent {
  platform: string;
  content_type: string;
  media_type: string;
  content: string;
  has_media: boolean;
  media_url?: string;
}
