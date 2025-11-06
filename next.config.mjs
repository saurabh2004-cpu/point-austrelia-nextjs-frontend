/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'd2x8w9o0be0lcl.cloudfront.net',
            // Add other domains if needed
        ],
        // Or use remotePatterns for more control (recommended)
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'd2x8w9o0be0lcl.cloudfront.net',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
