import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { connectDB } from '@/lib/db/mongoDB';
import User, { IUser } from '@/models/users';
import path from 'path';
import { stat, readdir, unlink, access } from 'fs/promises';

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

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        
        // Check if uploads directory exists
        try {
            await access(uploadsDir);
        } catch {
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

        // Get all user directories
        const userDirs = await readdir(uploadsDir, { withFileTypes: true });
        const userDirectories = userDirs.filter(dir => dir.isDirectory());

        const userStorageMap = new Map<string, UserStorageStats>();
        let totalFiles = 0;
        let totalSize = 0;

        // Process each user directory
        for (const userDir of userDirectories) {
            const userId = userDir.name;
            const userDirPath = path.join(uploadsDir, userId);

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

            // Get all files in user directory
            let files: string[];
            try {
                files = await readdir(userDirPath);
            } catch (err) {
                console.error(`Error reading directory for user ${userId}:`, err);
                continue;
            }

            const userFiles: Array<{
                filename: string;
                url: string;
                size: number;
                type: string;
                createdAt: Date;
            }> = [];

            for (const filename of files) {
                const filepath = path.join(userDirPath, filename);
                
                try {
                    const stats = await stat(filepath);
                    if (!stats.isFile()) continue;

                    // Extract file type from extension
                    const ext = path.extname(filename).toLowerCase();
                    const typeMap: Record<string, string> = {
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.png': 'image/png',
                        '.webp': 'image/webp',
                        '.gif': 'image/gif',
                        '.mp4': 'video/mp4',
                        '.webm': 'video/webm',
                        '.mp3': 'audio/mpeg',
                        '.wav': 'audio/wav',
                    };
                    const fileType = typeMap[ext] || 'application/octet-stream';

                    // Build URL
                    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                    const url = `${baseUrl}/uploads/${userId}/${filename}`;

                    // Extract timestamp from filename (format: timestamp-random.ext)
                    const timestampMatch = filename.match(/^(\d+)-/);
                    const createdAt = timestampMatch 
                        ? new Date(parseInt(timestampMatch[1]))
                        : stats.birthtime;

                    userFiles.push({
                        filename,
                        url,
                        size: stats.size,
                        type: fileType,
                        createdAt,
                    });

                    totalFiles++;
                    totalSize += stats.size;
                } catch (err) {
                    console.error(`Error reading file ${filepath}:`, err);
                }
            }

            // Sort files by creation date (newest first)
            userFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            if (userFiles.length > 0) {
                userStorageMap.set(userId, {
                    userId,
                    username: user.username || 'Unknown',
                    email: user.email || '',
                    fileCount: userFiles.length,
                    totalSize: userFiles.reduce((sum, f) => sum + f.size, 0),
                    files: userFiles,
                });
            }
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

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const deleted: string[] = [];
        const failed: string[] = [];

        for (const url of urls) {
            try {
                // Extract userId and filename from URL
                const match = url.match(/\/uploads\/([^\/]+)\/(.+)$/);
                if (!match) {
                    failed.push(url);
                    continue;
                }

                const [, userId, filename] = match;
                const filepath = path.join(uploadsDir, userId, filename);

                // Security: Prevent path traversal
                if (!filepath.startsWith(path.join(uploadsDir, userId))) {
                    failed.push(url);
                    continue;
                }

                // Delete file
                try {
                    await unlink(filepath);
                    deleted.push(url);
                } catch (err) {
                    console.error(`Error deleting file ${filepath}:`, err);
                    failed.push(url);
                }
            } catch (err) {
                console.error(`Error processing URL ${url}:`, err);
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
