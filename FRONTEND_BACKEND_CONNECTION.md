# Frontend-Backend Connection Guide

## Overview
This guide explains how to connect the frontend React application to the backend Supabase functions with the new storage system.

## Updated Components

### 1. AIContentGenerator Component (`src/components/AIContentGenerator.tsx`)

**Key Changes:**
- Updated to use the new API structure with `contentRequests`
- Added support for file metadata (`filePath`, `fileSize`, `mimeType`)
- Integrated with storage utilities for file downloads
- Enhanced media display with proper image/video rendering

**New Features:**
- File size display
- Direct file downloads using storage utilities
- External link viewing
- Proper error handling for missing files

### 2. GeneratedContentDisplay Component (`src/components/campaign/GeneratedContentDisplay.tsx`)

**Key Changes:**
- Updated `GeneratedContent` interface to include storage fields
- Modified download function to use storage utilities
- Enhanced media handling with file paths

### 3. CreateCampaign Component (`src/pages/CreateCampaign.tsx`)

**Key Changes:**
- Updated content generation to work with new storage system
- Removed fallback URLs (no more placeholder images)
- Added file metadata handling

## API Integration

### Request Format

The frontend now sends properly structured requests to the backend:

```typescript
const { data, error } = await supabase.functions.invoke('generate-campaign-content', {
  body: {
    campaignData: {
      id: campaignId, // null for new campaigns
      title: formData.campaign,
      brand_name: formData.brand,
      target_audience: formData.audience,
      campaign_goals: ['brand awareness', 'engagement']
    },
    contentRequests: [
      {
        platform: 'instagram',
        contentType: 'image',
        mediaType: 'image'
      },
      {
        platform: 'facebook',
        contentType: 'copy',
        mediaType: 'text'
      }
    ],
    aiSettings: {
      tone: 'professional',
      keywords: 'innovation, quality',
      customImagePrompt: 'optional custom prompt',
      customVideoPrompt: 'optional custom prompt'
    }
  }
});
```

### Response Format

The backend now returns enhanced content with storage information:

```typescript
{
  success: true,
  generatedContent: [
    {
      platform: 'instagram',
      contentType: 'image',
      mediaType: 'image',
      content: 'AI-generated professional image for Instagram...',
      mediaUrl: 'https://your-project.supabase.co/storage/v1/object/public/ai-generated-content/campaigns/123/image_456.png',
      filePath: 'campaigns/123/image/image_456.png',
      fileSize: 245760,
      mimeType: 'image/png'
    }
  ]
}
```

## Storage Integration

### File Display

Components now properly display media content:

```tsx
{item.mediaUrl && (
  <div className="mt-4">
    {item.type === 'image' && (
      <img 
        src={item.mediaUrl} 
        alt="Generated content" 
        className="max-w-full h-auto rounded-lg shadow-sm"
      />
    )}
    {item.type === 'video' && (
      <video 
        src={item.mediaUrl} 
        controls 
        className="max-w-full h-auto rounded-lg shadow-sm"
      />
    )}
  </div>
)}
```

### File Downloads

Use the storage utilities for file downloads:

```tsx
const handleDownloadMedia = async (item: GeneratedContent) => {
  if (!item.filePath) {
    toast({
      title: "Download Failed",
      description: "No file path available for download.",
      variant: "destructive"
    });
    return;
  }

  try {
    await downloadFile(item.filePath, `${item.type}_${item.platform || 'content'}`);
    toast({
      title: "Downloaded",
      description: "Media file downloaded successfully!",
    });
  } catch (error) {
    toast({
      title: "Download Failed",
      description: "Failed to download media file.",
      variant: "destructive"
    });
  }
};
```

## Environment Setup

### Required Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Storage Bucket Configuration

Ensure your storage bucket is properly configured:

1. **Bucket Name**: `ai-generated-content`
2. **Public Access**: Enabled (for marketing assets)
3. **File Size Limit**: 50MB (adjust as needed)
4. **Allowed MIME Types**: `image/*, video/*`

## Error Handling

### Frontend Error Handling

```typescript
try {
  const { data, error } = await supabase.functions.invoke('generate-campaign-content', {
    body: requestData
  });

  if (error) throw error;

  // Process successful response
  setGeneratedContent(data.generatedContent);
  
} catch (error: any) {
  console.error('Error generating content:', error);
  toast({
    title: "Generation Failed",
    description: error.message || "Failed to generate content. Please try again.",
    variant: "destructive"
  });
  
  // Clear content on error
  setGeneratedContent([]);
}
```

### Storage Error Handling

```typescript
const handleDownloadMedia = async (item: GeneratedContent) => {
  if (!item.filePath) {
    toast({
      title: "Download Failed",
      description: "No file path available for download.",
      variant: "destructive"
    });
    return;
  }

  try {
    await downloadFile(item.filePath, `${item.type}_${item.platform || 'content'}`);
    toast({
      title: "Downloaded",
      description: "Media file downloaded successfully!",
    });
  } catch (error) {
    toast({
      title: "Download Failed",
      description: "Failed to download media file.",
      variant: "destructive"
    });
  }
};
```

## Testing the Connection

### 1. Test Content Generation

1. Navigate to the AI Content Generator
2. Fill in the form with test data
3. Click "Generate Professional Content"
4. Verify that:
   - Content is generated successfully
   - Images/videos are displayed properly
   - File metadata is shown
   - Download buttons work

### 2. Test File Downloads

1. Generate content with images or videos
2. Click the "Download" button
3. Verify that files download correctly
4. Check file names and sizes

### 3. Test Campaign Creation

1. Create a new campaign
2. Generate content during campaign creation
3. Verify that content is saved with the campaign
4. Check that file paths are stored correctly

## Troubleshooting

### Common Issues

1. **"No file path available" Error**
   - Check that the backend is returning `filePath` in the response
   - Verify storage bucket is created and accessible
   - Check RLS policies on storage bucket

2. **Images/Videos Not Displaying**
   - Verify `mediaUrl` is a valid Supabase storage URL
   - Check that files are publicly accessible
   - Ensure proper CORS configuration

3. **Download Failures**
   - Check file path format
   - Verify storage bucket permissions
   - Ensure user has proper authentication

4. **Content Generation Failures**
   - Check environment variables
   - Verify edge function deployment
   - Check function logs for errors

### Debug Commands

```bash
# Check edge function logs
supabase functions logs generate-campaign-content

# Check storage bucket contents
supabase storage list ai-generated-content

# Test function locally
supabase functions serve generate-campaign-content --env-file .env.local
```

## Performance Considerations

### File Loading

- Images and videos are loaded directly from Supabase storage
- No base64 data transfer reduces payload size
- CDN caching improves load times

### Error Recovery

- Failed generations don't provide fallback content
- Users get clear error messages
- Retry mechanisms are available

### Storage Optimization

- Files are organized by campaign ID
- Metadata is stored separately from file content
- Automatic cleanup on content deletion

## Security

### Access Control

- All storage access is controlled by RLS policies
- Users can only access their own campaign files
- Public access is limited to marketing assets

### File Validation

- MIME types are validated on upload
- File sizes are limited
- Malicious files are blocked

## Next Steps

1. **Deploy the updated components**
2. **Test the full workflow**
3. **Monitor storage usage**
4. **Set up monitoring and alerts**
5. **Optimize performance as needed**

## Support

For issues with the frontend-backend connection:

1. Check the troubleshooting section above
2. Review Supabase function logs
3. Verify environment variables
4. Test storage bucket access
5. Check RLS policies 