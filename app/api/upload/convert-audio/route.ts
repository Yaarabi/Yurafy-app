import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { createErrorResponse } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logging";

// Use edge runtime for better performance with audio processing
// Note: For production, consider using a dedicated audio processing service

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
        }

        const userId = session.user.id;
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return createErrorResponse("No file uploaded", 400, "NO_FILE");
        }

        // Check if it's an audio file
        if (!file.type.startsWith("audio/")) {
            return createErrorResponse("File must be an audio file", 400, "INVALID_FILE_TYPE");
        }

        // For WebM audio, we'll upload it as-is but with .ogg extension
        // WhatsApp supports OGG with opus codec, and WebM often uses opus
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        
        // Determine the best output format
        let filename: string;
        let mimeType: string;
        
        if (file.type.includes("webm") || file.type.includes("ogg")) {
            // WebM with opus can be served as OGG for WhatsApp compatibility
            filename = `${timestamp}-${randomSuffix}.ogg`;
            mimeType = "audio/ogg";
        } else if (file.type.includes("mp4") || file.type.includes("m4a")) {
            filename = `${timestamp}-${randomSuffix}.m4a`;
            mimeType = "audio/mp4";
        } else if (file.type.includes("mpeg") || file.type.includes("mp3")) {
            filename = `${timestamp}-${randomSuffix}.mp3`;
            mimeType = "audio/mpeg";
        } else {
            // Default to original format
            const ext = file.name.split(".").pop() || "audio";
            filename = `${timestamp}-${randomSuffix}.${ext}`;
            mimeType = file.type;
        }

        // Upload to Vercel Blob
        const pathname = `uploads/${userId}/${filename}`;
        const blob = await put(pathname, file, {
            access: "public",
            addRandomSuffix: false,
            contentType: mimeType,
        });

        logger.info("Audio uploaded", { userId, filename, originalType: file.type, newType: mimeType });

        return NextResponse.json({
            message: "Audio uploaded successfully",
            url: blob.url,
            filename,
            originalType: file.type,
            convertedType: mimeType,
        });
    } catch (error) {
        logger.error("POST /api/upload/convert-audio error", error);
        return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
    }
}
