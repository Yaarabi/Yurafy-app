import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { validateFileUpload, sanitizeFilename } from "@/lib/utils/validation";
import { withRateLimit, getStrictRateLimit } from "@/lib/utils/rateLimit";
import { handleApiError, createErrorResponse } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logging";

// Route config for Next.js 15 to handle larger file uploads
export const config = {
    api: {
        bodyParser: false, // Disable body parsing for file uploads
    },
};

// Route segment config for body size limits
export const maxDuration = 60; // Max duration in seconds

// POST: Upload new file with validation
export const POST = withRateLimit(async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return createErrorResponse("Unauthorized - Authentication required", 401, "UNAUTHORIZED");
        }

        const userId = session.user.id;
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return createErrorResponse("No file uploaded", 400, "NO_FILE");
        }

        // Validate file upload
        const validation = validateFileUpload(file, {
            maxSize: 10 * 1024 * 1024, // 10MB default
            allowedMimeTypes: [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
                "image/gif",
                "video/mp4",
                "video/webm",
                "audio/mpeg",
                "audio/mp3",
                "audio/wav",
            ],
        });

        if (!validation.valid) {
            return createErrorResponse(validation.error || "Invalid file", 400, "INVALID_FILE");
        }

        // Sanitize filename
        const sanitizedName = sanitizeFilename(file.name);
        const fileExtension = sanitizedName.split(".").pop() || "";
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `${timestamp}-${randomSuffix}.${fileExtension}`;

        // Upload to Vercel Blob
        const pathname = `uploads/${userId}/${filename}`;
        const blob = await put(pathname, file, {
            access: "public",
            addRandomSuffix: false,
        });

        logger.info("File uploaded", { userId, filename, size: file.size, type: file.type, url: blob.url });

        return NextResponse.json({
            message: "File uploaded successfully",
            url: blob.url,
            filename,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        logger.error("POST /api/upload error", error);
        return handleApiError(error);
    }
}, getStrictRateLimit()); // Use strict rate limit for file uploads

// PUT: Update file (delete old, upload new)
export const PUT = withRateLimit(async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return createErrorResponse("Unauthorized - Authentication required", 401, "UNAUTHORIZED");
        }

        const userId = session.user.id;
        const formData = await req.formData();
        const oldUrlsJson = formData.get("oldUrls") as string | null;
        
        if (!oldUrlsJson) {
            return createErrorResponse("Old file URLs are required", 400, "MISSING_OLD_URLS");
        }

        const oldUrls = JSON.parse(oldUrlsJson) as string[];
        const file = formData.get("file") as File | null;

        if (!file) {
            return createErrorResponse("No new file uploaded", 400, "NO_FILE");
        }

        // Validate new file
        const validation = validateFileUpload(file);
        if (!validation.valid) {
            return createErrorResponse(validation.error || "Invalid file", 400, "INVALID_FILE");
        }

        // Delete old files from Vercel Blob (verify ownership)
        for (const url of oldUrls) {
            if (url.includes(`/uploads/${userId}/`)) {
                try {
                    await del(url);
                    logger.debug("Deleted old file", { userId, url });
                } catch (err) {
                    logger.warn("Failed to delete old file", { error: err, userId, url });
                }
            }
        }

        // Upload new file to Vercel Blob
        const sanitizedName = sanitizeFilename(file.name);
        const fileExtension = sanitizedName.split(".").pop() || "";
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `${timestamp}-${randomSuffix}.${fileExtension}`;

        const pathname = `uploads/${userId}/${filename}`;
        const blob = await put(pathname, file, {
            access: "public",
            addRandomSuffix: false,
        });

        logger.info("File updated", { userId, filename, url: blob.url });

        return NextResponse.json({
            message: "File updated successfully",
            url: blob.url,
            filename,
        });
    } catch (error) {
        logger.error("PUT /api/upload error", error);
        return handleApiError(error);
    }
}, getStrictRateLimit());

// DELETE: Remove specified files (with ownership verification)
export const DELETE = withRateLimit(async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return createErrorResponse("Unauthorized - Authentication required", 401, "UNAUTHORIZED");
        }

        const userId = session.user.id;
        const body = await req.json();
        const urls = body.urls as string[];

        if (!Array.isArray(urls) || urls.length === 0) {
            return createErrorResponse("File URLs array is required", 400, "MISSING_URLS");
        }

        const deleted: string[] = [];
        const failed: string[] = [];

        for (const url of urls) {
            // Verify ownership - only allow deletion of files in user's upload directory
            if (url.includes(`/uploads/${userId}/`)) {
                try {
                    await del(url);
                    deleted.push(url);
                    logger.debug("File deleted from Vercel Blob", { userId, url });
                } catch (err) {
                    logger.warn("Failed to delete file", { error: err, userId, url });
                    failed.push(url);
                }
            } else {
                // File doesn't belong to this user
                failed.push(url);
                logger.warn("Unauthorized file deletion attempt", { userId, url });
            }
        }

        return NextResponse.json({
            message: deleted.length > 0 ? "Files deleted successfully" : "No files were deleted",
            deleted,
            failed: failed.length > 0 ? failed : undefined,
        });
    } catch (error) {
        logger.error("DELETE /api/upload error", error);
        return handleApiError(error);
    }
}, getStrictRateLimit());
