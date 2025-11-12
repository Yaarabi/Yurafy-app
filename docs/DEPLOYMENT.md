# Deployment Guide

## File Upload Configuration

### The Problem
The application's file upload feature uses filesystem operations (`writeFile`, `mkdir`, `unlink`) which **do not work on serverless platforms** like Vercel. Serverless functions have read-only filesystems except for `/tmp`, which is:
- Ephemeral (cleared between invocations)
- Not accessible via public URLs
- Limited in size

### The Solution: Vercel Blob Storage
We've migrated the upload system to use **Vercel Blob Storage**, which provides:
- ✅ Serverless-compatible storage
- ✅ Public URL access
- ✅ Automatic CDN distribution
- ✅ Built-in file management
- ✅ No size limits (within plan)

## Setup Instructions

### 1. Create a Vercel Blob Store

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Storage** tab
4. Click **Create Database** → **Blob**
5. Name your store (e.g., "yura-uploads")
6. Click **Create**

### 2. Get the Token

After creating the Blob store:
1. Click on your newly created Blob store
2. Go to the **Settings** tab
3. Find **BLOB_READ_WRITE_TOKEN**
4. Copy the token value

### 3. Add Environment Variable

#### For Vercel Deployment:
1. Go to **Project Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: (paste the token you copied)
   - **Environments**: Production, Preview, Development (select all)
3. Click **Save**

#### For Local Development:
Add to your `.env.local` file:
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

> **Note**: Local development can work without this token if you have a `public/uploads/` directory, but setting it ensures consistency between local and production environments.

### 4. Redeploy Your Application

After adding the environment variable:
1. Trigger a new deployment (push to your main branch)
2. Or click **Redeploy** in Vercel dashboard
3. Test file uploads in production

## How It Works

### Upload Flow
```typescript
// Before (filesystem - doesn't work on Vercel)
await writeFile(filepath, buffer);
return { url: `${baseUrl}/uploads/${userId}/${filename}` };

// After (Vercel Blob - works everywhere)
const blob = await put(pathname, file, { access: "public" });
return { url: blob.url }; // Returns CDN URL
```

### Key Changes
1. **POST /api/upload** - Uploads to Vercel Blob, returns public CDN URL
2. **PUT /api/upload** - Deletes old blob, uploads new one
3. **DELETE /api/upload** - Deletes blobs by URL
4. Files are stored with path: `uploads/{userId}/{timestamp}-{random}.{ext}`
5. All files are publicly accessible via CDN URLs

## Migration Notes

### Existing Files
If you have existing files in `public/uploads/`:
- They won't be automatically migrated
- New uploads will go to Vercel Blob
- Old file URLs will still work if kept in `public/uploads/`
- Consider migrating old files manually if needed

### URL Format Changes
- **Before**: `https://yourdomain.com/uploads/userId/file.jpg`
- **After**: `https://blob.vercel-storage.com/uploads/userId/file-hash123.jpg`

Database references to old URLs will continue to work if those files remain in `public/uploads/`.

## Troubleshooting

### Upload Fails with "Missing Credentials"
- ✅ Verify `BLOB_READ_WRITE_TOKEN` is set in Vercel environment variables
- ✅ Redeploy after adding the token
- ✅ Check the token has read AND write permissions

### Upload Works Locally but Fails in Production
- ✅ Ensure token is added to **Production** environment
- ✅ Check Vercel deployment logs for errors
- ✅ Verify the Blob store is in the same Vercel team/account

### Files Upload but Return 404
- ✅ Files uploaded to Blob are immediately accessible
- ✅ Check the returned URL format is correct
- ✅ Ensure blob store has public access enabled

### Rate Limiting Issues
The upload endpoint uses strict rate limiting:
- 10 requests per 15 minutes per IP
- Increase in `app/api/upload/route.ts` if needed

## Alternative: Using Other Storage Providers

If you prefer not to use Vercel Blob, you can integrate:
- **AWS S3** - Use `@aws-sdk/client-s3`
- **Cloudinary** - Use `cloudinary` package
- **UploadThing** - Use `uploadthing` package
- **Supabase Storage** - Use `@supabase/storage-js`

All require updating `app/api/upload/route.ts` with the provider's SDK.

## Security Considerations

1. **Authentication**: All upload endpoints require authentication
2. **File Validation**: Files are validated for type and size
3. **Filename Sanitization**: Filenames are sanitized to prevent exploits
4. **User Isolation**: Files are stored in user-specific paths
5. **Deletion Security**: Users can only delete their own files
6. **Rate Limiting**: Strict limits prevent abuse

## Cost Considerations

Vercel Blob Storage pricing (as of 2024):
- **Hobby Plan**: 500 MB free, then $0.15/GB/month
- **Pro Plan**: 1 GB free, then $0.15/GB/month
- **Enterprise**: Custom pricing

Bandwidth costs may apply. Monitor usage in Vercel dashboard.

## Support

For issues with:
- **Vercel Blob**: [Vercel Support](https://vercel.com/support)
- **Application**: Open an issue in the repository
