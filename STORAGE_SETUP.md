# Storage Setup Guide

## Overview
This guide will help you set up proper file storage for AI-generated content, replacing the current problematic approach of storing base64 data and temporary URLs directly in the database.

## Current Issues Fixed
1. **Base64 Storage**: No longer storing entire image/video data in database columns
2. **Temporary URLs**: No longer relying on expiring URLs from AI services
3. **Proper File Management**: Files are now stored in Supabase storage with proper metadata tracking

## Step 1: Create Storage Bucket

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `ai-generated-content`
   - **Public**: ✅ Yes (marketing assets need to be publicly accessible)
   - **File size limit**: 50MB (adjust as needed)
   - **Allowed MIME types**: `image/*, video/*`
5. Click **Create bucket**

### Option B: Using Supabase CLI
```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Create the bucket
supabase storage create ai-generated-content --public
```

## Step 2: Apply Database Migration

Run the new migration to add storage fields:

```bash
# If using Supabase CLI
supabase db push

# Or manually apply the migration file:
# supabase/migrations/20250703030000-add-file-storage.sql
```

## Step 3: Update Environment Variables

Add the following to your `.env` file:

```env
# Supabase Storage
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# AI Services (only Gemini now)
GEMINI_API_KEY=your_gemini_api_key
```

## Step 4: Deploy Edge Functions

Deploy the updated edge functions:

```bash
# Deploy the generate-campaign-content function
supabase functions deploy generate-campaign-content

# Or deploy all functions
supabase functions deploy
```

## Step 5: Test the Storage System

### Test Image Generation
1. Create a new campaign
2. Generate image content
3. Verify that:
   - Files are stored in the `ai-generated-content` bucket
   - Database contains file paths, not base64 data
   - Public URLs are accessible

### Test Video Generation
1. Generate video content
2. Verify that:
   - Video files are properly stored
   - File metadata is recorded
   - URLs are permanent

## File Structure

The storage bucket will organize files as follows:

```
ai-generated-content/
├── campaigns/
│   ├── {campaign-id}/
│   │   ├── image/
│   │   │   ├── image_1234567890_abc123.png
│   │   │   └── image_1234567891_def456.jpg
│   │   ├── video/
│   │   │   ├── video_1234567892_ghi789.mp4
│   │   │   └── video_1234567893_jkl012.mp4
│   │   └── document/
│   │       └── document_1234567894_mno345.pdf
│   └── {another-campaign-id}/
│       └── ...
```

## Database Schema Changes

### New Fields Added to `campaign_content`:
- `file_path`: Path to the file in storage
- `file_size`: Size of the file in bytes
- `mime_type`: MIME type of the file
- `storage_bucket`: Bucket name (default: 'ai-generated-content')

### New Table: `ai_generated_files`
Tracks detailed metadata about AI-generated files:
- File information (path, size, type)
- AI service used (Gemini, OpenAI, etc.)
- Generation prompts
- Original URLs (for reference)

## API Changes

### Content Generation Response
The content generation API now returns:
```json
{
  "success": true,
  "generatedContent": [
    {
      "platform": "instagram",
      "contentType": "image",
      "mediaType": "image",
      "content": "AI-generated professional image...",
      "mediaUrl": "https://your-project.supabase.co/storage/v1/object/public/ai-generated-content/campaigns/123/image_123.png",
      "filePath": "campaigns/123/image/image_123.png",
      "fileSize": 245760,
      "mimeType": "image/png"
    }
  ]
}
```

### File Management Functions
New utility functions available:
- `getFileUrl(filePath)`: Get public URL for a file
- `downloadFile(filePath)`: Download a file
- `deleteFile(filePath)`: Delete a file
- `uploadFile(file, campaignId, contentType)`: Upload a new file

## Benefits of New System

1. **Performance**: Database queries are faster without large base64 data
2. **Scalability**: Files are stored efficiently in object storage
3. **Reliability**: No more expiring URLs
4. **Cost**: Reduced database storage costs
5. **Organization**: Proper file structure and metadata tracking
6. **Security**: Files are properly secured with RLS policies

## Troubleshooting

### Common Issues

1. **Storage Bucket Not Found**
   - Verify bucket name is exactly `ai-generated-content`
   - Check bucket permissions (should be public)

2. **File Upload Fails**
   - Check file size limits
   - Verify MIME type restrictions
   - Ensure proper authentication

3. **Database Migration Errors**
   - Check for existing data conflicts
   - Verify RLS policies are properly set

4. **Edge Function Deployment Issues**
   - Check environment variables
   - Verify function dependencies

### Debug Commands

```bash
# Check storage bucket
supabase storage list ai-generated-content

# Check database tables
supabase db diff

# Check edge function logs
supabase functions logs generate-campaign-content
```

## Migration from Old System

If you have existing campaigns with base64 data:

1. **Backup existing data** before migration
2. **Run the migration** to add new fields
3. **Gradually migrate** old content to new storage system
4. **Clean up** old base64 data after verification

## Security Considerations

1. **RLS Policies**: All storage access is controlled by Row Level Security
2. **Public Access**: Marketing assets are publicly accessible (by design)
3. **File Validation**: MIME types and file sizes are validated
4. **Access Control**: Only authenticated users can upload files

## Monitoring

Monitor storage usage:
- File count and total size
- Upload/download patterns
- Error rates
- Cost implications

## Support

For issues with this storage system:
1. Check the troubleshooting section above
2. Review Supabase storage documentation
3. Check edge function logs
4. Verify environment variables and permissions 