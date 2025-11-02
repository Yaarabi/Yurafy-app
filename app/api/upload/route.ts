import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import fs from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { validateFileUpload, sanitizeFilename } from "@/lib/utils/validation";
import { withRateLimit, getStrictRateLimit } from "@/lib/utils/rateLimit";
import { handleApiError, createErrorResponse } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logging";

// Shared helper
async function ensureUserDir(userId: string) {
    const userDir = path.join(process.cwd(), "public", "uploads", userId);
    if (!fs.existsSync(userDir)) {
        await mkdir(userDir, { recursive: true });
    }
    return userDir;
}

// Helper to build full URL
function buildFileUrl(userId: string, filename: string) {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return `${baseUrl}/uploads/${userId}/${filename}`;
}

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

        // Ensure user directory exists
        const userDir = await ensureUserDir(userId);
        const filepath = path.join(userDir, filename);

        // Write file
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filepath, buffer);

        logger.info("File uploaded", { userId, filename, size: file.size, type: file.type });

        return NextResponse.json({
            message: "File uploaded successfully",
            url: buildFileUrl(userId, filename),
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

        // Delete old files (verify ownership)
        for (const url of oldUrls) {
            if (url.includes(`/uploads/${userId}/`)) {
                const relativePath = url.split(`/uploads/${userId}/`)[1];
                if (relativePath) {
                    const filePath = path.join(process.cwd(), "public", "uploads", userId, relativePath);
                    try {
                        // Verify file exists and belongs to user
                        if (fs.existsSync(filePath)) {
                            await unlink(filePath);
                            logger.debug("Deleted old file", { userId, filePath });
                        }
                    } catch (err) {
                        logger.warn("Failed to delete old file", { error: err, userId, filePath });
                    }
                }
            }
        }

        // Upload new file
        const sanitizedName = sanitizeFilename(file.name);
        const fileExtension = sanitizedName.split(".").pop() || "";
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `${timestamp}-${randomSuffix}.${fileExtension}`;

        const userDir = await ensureUserDir(userId);
        const filepath = path.join(userDir, filename);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filepath, buffer);

        logger.info("File updated", { userId, filename });

        return NextResponse.json({
            message: "File updated successfully",
            url: buildFileUrl(userId, filename),
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
                const relativePath = url.split(`/uploads/${userId}/`)[1];
                if (relativePath) {
                    const filePath = path.join(process.cwd(), "public", "uploads", userId, relativePath);
                    
                    // Security: Prevent path traversal
                    if (!filePath.startsWith(path.join(process.cwd(), "public", "uploads", userId))) {
                        failed.push(url);
                        logger.warn("Path traversal attempt blocked", { userId, url });
                        continue;
                    }

                    try {
                        if (fs.existsSync(filePath)) {
                            await unlink(filePath);
                            deleted.push(url);
                            logger.debug("File deleted", { userId, filePath });
                        } else {
                            failed.push(url);
                        }
                    } catch (err) {
                        logger.warn("Failed to delete file", { error: err, userId, filePath });
                        failed.push(url);
                    }
                } else {
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
