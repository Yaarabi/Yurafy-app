import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    images: {
        domains: ['picsum.photos', 'localhost'],
        remotePatterns: [
        {
            protocol: 'http',
            hostname: 'localhost',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: '*.yurafy.com',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'yurafy.com',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'images.pexels.com',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: '*.public.blob.vercel-storage.com',
            pathname: '/**',
        },
        // Added for tech logos
        {
            protocol: 'https',
            hostname: 'raw.githubusercontent.com',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'cdn-icons-png.flaticon.com',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'avatars.githubusercontent.com',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'youcan.shop',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'cdn.simpleicons.org',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'khamsat.hsoubcdn.com',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'th.bing.com',
            pathname: '/**',
        },
        ],
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
