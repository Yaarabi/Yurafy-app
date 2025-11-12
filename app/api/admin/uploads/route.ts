import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import User, { IUser } from '@/models/users';
import { list, del } from '@vercel/blob';

interface FileInfo {
    userId: string;
    username: string;
    email: string;
    filename: string;
    filepath: string;
    url: string;
    size: number;
    type: string;
    createdAt: Date;
}

interface UserStorageStats {
    userId: string;
    username: string;
    email: string;
    fileCount: number;
    totalSize: number;
    files: Array<{
        filename: string;
        url: string;
        size: number;
        type: string;
        createdAt: Date;
    }>;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // List all blobs with prefix "uploads/"
        let allBlobs;
        try {
            const { blobs } = await list({ prefix: 'uploads/' });
            allBlobs = blobs;
        } catch (err) {
            console.error('Error listing blobs:', err);
            // Return empty stats if blob storage not configured
            return NextResponse.json({
                files: [],
                stats: {
                    totalFiles: 0,
                    totalSize: 0,
                    totalUsers: 0,
                },
                userStats: [],
            });
        }

        const userStorageMap = new Map<string, UserStorageStats>();
        let totalFiles = 0;
        let totalSize = 0;

        // Group blobs by user
        for (const blob of allBlobs) {
            // Extract userId from pathname: uploads/userId/filename
            const pathMatch = blob.pathname.match(/^uploads\/([^\/]+)\/(.+)$/);
            if (!pathMatch) continue;

            const [, userId, filename] = pathMatch;

            // Get or create user stats entry
            if (!userStorageMap.has(userId)) {
                // Get user info from database
                let user: Pick<IUser, 'username' | 'email'> | null;
                try {
                    user = await User.findById(userId).select('username email').lean() as Pick<IUser, 'username' | 'email'> | null;
                } catch (err) {
                    console.error(`Error fetching user ${userId}:`, err);
                    continue;
                }

                if (!user) {
                    // User might have been deleted, but files still exist
                    continue;
                }

                userStorageMap.set(userId, {
                    userId,
                    username: user.username || 'Unknown',
                    email: user.email || '',
                    fileCount: 0,
                    totalSize: 0,
                    files: [],
                });
            }

            const userStats = userStorageMap.get(userId)!;

            // Extract file type from pathname extension
            const ext = filename.split('.').pop()?.toLowerCase() || '';
            const typeMap: Record<string, string> = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'webp': 'image/webp',
                'gif': 'image/gif',
                'mp4': 'video/mp4',
                'webm': 'video/webm',
                'mp3': 'audio/mpeg',
                'wav': 'audio/wav',
            };
            const fileType = typeMap[ext] || 'application/octet-stream';

            // Extract timestamp from filename (format: timestamp-random.ext)
            const timestampMatch = filename.match(/^(\d+)-/);
            const createdAt = timestampMatch 
                ? new Date(parseInt(timestampMatch[1]))
                : new Date(blob.uploadedAt);

            userStats.files.push({
                filename,
                url: blob.url,
                size: blob.size,
                type: fileType,
                createdAt,
            });

            userStats.fileCount++;
            userStats.totalSize += blob.size;
            totalFiles++;
            totalSize += blob.size;
        }

        // Sort files by creation date (newest first) for each user
        for (const userStats of userStorageMap.values()) {
            userStats.files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        // Convert map to array and sort by total size (largest first)
        const userStats = Array.from(userStorageMap.values()).sort(
            (a, b) => b.totalSize - a.totalSize
        );

        return NextResponse.json({
            files: userStats.flatMap(stats => 
                stats.files.map(file => ({
                    ...file,
                    userId: stats.userId,
                    username: stats.username,
                    email: stats.email,
                }))
            ),
            stats: {
                totalFiles,
                totalSize,
                totalUsers: userStats.length,
            },
            userStats,
        });
    } catch (err) {
        console.error('Admin uploads error:', err);
        return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
    }
}

// DELETE endpoint to delete files
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { urls } = body;

        if (!Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json({ error: 'File URLs array is required' }, { status: 400 });
        }

        const deleted: string[] = [];
        const failed: string[] = [];

        for (const url of urls) {
            try {
                // Delete blob by URL
                await del(url);
                deleted.push(url);
            } catch (err) {
                console.error(`Error deleting blob ${url}:`, err);
                failed.push(url);
            }
        }

        return NextResponse.json({
            message: deleted.length > 0 ? 'Files deleted successfully' : 'No files were deleted',
            deleted,
            failed: failed.length > 0 ? failed : undefined,
        });
    } catch (err) {
        console.error('DELETE /api/admin/uploads error:', err);
        return NextResponse.json({ error: 'Failed to delete files' }, { status: 500 });
    }
}
