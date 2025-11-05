"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, Search, Trash2, HardDrive, File, Image, Video, Music,
    Loader2, AlertCircle, Download, User, Calendar, FileText,
    Filter, X
} from "lucide-react";
import toast from "react-hot-toast";

interface FileItem {
    userId: string;
    username: string;
    email: string;
    filename: string;
    url: string;
    size: number;
    type: string;
    createdAt: Date;
}

interface StorageStats {
    totalFiles: number;
    totalSize: number;
    totalUsers: number;
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

export default function AdminUploadsManagement() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [userStats, setUserStats] = useState<UserStorageStats[]>([]);
    const [stats, setStats] = useState<StorageStats>({
        totalFiles: 0,
        totalSize: 0,
        totalUsers: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterUserId, setFilterUserId] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"list" | "user">("list");
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [deletingFiles, setDeletingFiles] = useState(false);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    useEffect(() => {
        fetchUploads();
    }, []);

    const fetchUploads = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/uploads');
            if (!response.ok) throw new Error('Failed to fetch uploads');
            const data = await response.json();
            
            // Convert date strings to Date objects
            const processedFiles = data.files.map((file: any) => ({
                ...file,
                createdAt: new Date(file.createdAt),
            }));
            
            const processedUserStats = data.userStats.map((user: any) => ({
                ...user,
                files: user.files.map((file: any) => ({
                    ...file,
                    createdAt: new Date(file.createdAt),
                })),
            }));

            setFiles(processedFiles);
            setUserStats(processedUserStats);
            setStats(data.stats || { totalFiles: 0, totalSize: 0, totalUsers: 0 });
        } catch (error) {
            console.error('Error fetching uploads:', error);
            toast.error('Failed to load uploads');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFiles = async (urls: string[]) => {
        if (!confirm(`Are you sure you want to delete ${urls.length} file(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeletingFiles(true);
            const response = await fetch('/api/admin/uploads', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls }),
            });

            if (!response.ok) throw new Error('Failed to delete files');
            
            const data = await response.json();
            if (data.failed && data.failed.length > 0) {
                toast.error(`Some files could not be deleted: ${data.failed.length}`);
            } else {
                toast.success(`Successfully deleted ${data.deleted.length} file(s)`);
            }

            setSelectedFiles(new Set());
            fetchUploads();
        } catch (error) {
            console.error('Error deleting files:', error);
            toast.error('Failed to delete files');
        } finally {
            setDeletingFiles(false);
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
        if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
        if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
        return <File className="w-5 h-5" />;
    };

    const getFileTypeCategory = (type: string): string => {
        if (type.startsWith('image/')) return 'image';
        if (type.startsWith('video/')) return 'video';
        if (type.startsWith('audio/')) return 'audio';
        return 'other';
    };

    // Filter files
    const filteredFiles = files.filter(file => {
        const matchesSearch = 
            file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === "all" || getFileTypeCategory(file.type) === filterType;
        const matchesUser = filterUserId === "all" || file.userId === filterUserId;
        
        return matchesSearch && matchesType && matchesUser;
    });

    const uniqueUsers = Array.from(new Set(files.map(f => ({ id: f.userId, username: f.username, email: f.email }))))
        .map((u, idx, arr) => arr.findIndex(item => item.id === u.id) === idx ? u : null)
        .filter(Boolean) as Array<{ id: string; username: string; email: string }>;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Upload className="w-6 h-6 text-indigo-600" />
                        Uploads Management
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage uploaded files and monitor storage usage
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === "list" ? "user" : "list")}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        {viewMode === "list" ? "User View" : "List View"}
                    </button>
                </div>
            </div>

            {/* Storage Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFiles}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <HardDrive className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Storage</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(stats.totalSize)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Users with Files</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search files, users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio</option>
                        <option value="other">Other</option>
                    </select>

                    {/* User Filter */}
                    <select
                        value={filterUserId}
                        onChange={(e) => setFilterUserId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Users</option>
                        {uniqueUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selected Files Actions */}
                {selectedFiles.size > 0 && (
                    <div className="mt-4 flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                            {selectedFiles.size} file(s) selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedFiles(new Set())}
                                className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => handleDeleteFiles(Array.from(selectedFiles))}
                                disabled={deletingFiles}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
                            >
                                {deletingFiles ? "Deleting..." : "Delete Selected"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Files List / User View */}
            {viewMode === "list" ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedFiles(new Set(filteredFiles.map(f => f.url)));
                                                } else {
                                                    setSelectedFiles(new Set());
                                                }
                                            }}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uploaded</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredFiles.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No files found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFiles.map((file, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFiles.has(file.url)}
                                                    onChange={(e) => {
                                                        const newSelected = new Set(selectedFiles);
                                                        if (e.target.checked) {
                                                            newSelected.add(file.url);
                                                        } else {
                                                            newSelected.delete(file.url);
                                                        }
                                                        setSelectedFiles(newSelected);
                                                    }}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getFileIcon(file.type)}
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                                        {file.filename}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900 dark:text-white">{file.username}</div>
                                                    <div className="text-gray-500 dark:text-gray-400">{file.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {formatBytes(file.size)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {file.type}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {file.createdAt.toLocaleDateString()} {file.createdAt.toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1 text-blue-600 hover:text-blue-800 transition"
                                                        title="View/Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeleteFiles([file.url])}
                                                        className="p-1 text-red-600 hover:text-red-800 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {userStats.map((user) => (
                        <div
                            key={user.userId}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                                onClick={() => setExpandedUser(expandedUser === user.userId ? null : user.userId)}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">{user.username}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.fileCount} file(s)
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatBytes(user.totalSize)}
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    {expandedUser === user.userId ? (
                                        <X className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <File className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>
                            <AnimatePresence>
                                {expandedUser === user.userId && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="space-y-2">
                                                {user.files.map((file, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            {getFileIcon(file.type)}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                    {file.filename}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {formatBytes(file.size)} • {file.type}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-4">
                                                            <a
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 text-blue-600 hover:text-blue-800 transition"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                            <button
                                                                onClick={() => handleDeleteFiles([file.url])}
                                                                className="p-1 text-red-600 hover:text-red-800 transition"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
