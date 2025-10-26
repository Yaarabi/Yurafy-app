import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import fs from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

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
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return `${baseUrl}/uploads/${userId}/${filename}`;
}

// POST: Upload new image
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ message: "No file uploaded" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        const userDir = await ensureUserDir(userId);
        const filepath = path.join(userDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json({
        message: "File uploaded successfully",
        url: buildFileUrl(userId, filename), // ✅ full URL with domain
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Upload failed", error }, { status: 500 });
    }
}

// PUT: Update image (delete old, upload new)
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const formData = await req.formData();
        const oldUrls = JSON.parse(formData.get("oldUrls") as string) as string[];
        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ message: "No new file uploaded" }, { status: 400 });

        // Delete old images
        for (const url of oldUrls) {
        if (url.includes(`/uploads/${userId}/`)) {
            const relativePath = url.split(`/uploads/${userId}/`)[1];
            if (relativePath) {
            const filePath = path.join(process.cwd(), "public", "uploads", userId, relativePath);
            try {
                await unlink(filePath);
            } catch (err) {
                console.warn(`Failed to delete ${filePath}:`, err);
            }
            }
        }
        }

        // Save new image
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        const userDir = await ensureUserDir(userId);
        const filepath = path.join(userDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json({
        message: "Image updated successfully",
        url: buildFileUrl(userId, filename), // ✅ full URL with domain
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Update failed", error }, { status: 500 });
    }
}

// DELETE: Remove specified images
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();
        const urls = body.urls as string[];
        const deleted: string[] = [];

        for (const url of urls) {
        if (url.includes(`/uploads/${userId}/`)) {
            const relativePath = url.split(`/uploads/${userId}/`)[1];
            if (relativePath) {
            const filePath = path.join(process.cwd(), "public", "uploads", userId, relativePath);
            try {
                await unlink(filePath);
                deleted.push(url);
            } catch (err) {
                console.warn(`Failed to delete ${filePath}:`, err);
            }
            }
        }
        }

        return NextResponse.json({
        message: "Images deleted",
        deleted,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Delete failed", error }, { status: 500 });
    }
}
