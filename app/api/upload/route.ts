
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth"; 

export async function POST(req: Request) {
    try {
        // Check session
        const session = await getServerSession(authOptions);
        if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Parse formData
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
        return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to /public/uploads
        const filename = `${Date.now()}-${file.name}`;
        const filepath = path.join(process.cwd(), "public", "uploads", filename);
        await writeFile(filepath, buffer);

        // Return URL
        return NextResponse.json({
        message: "File uploaded successfully",
        url: `/uploads/${filename}`,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Upload failed", error }, { status: 500 });
    }
}
