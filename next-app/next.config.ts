import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Environment-specific configuration
  env: {
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },
  
  // Enable strict mode for better error detection
  reactStrictMode: true,
  
  // Output configuration
  output: process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'standalone' : undefined,
  
  // Image optimization settings
  images: {
    domains: process.env.NEXT_PUBLIC_APP_ENV === 'production' 
      ? ['yourapp.com', 'cdn.yourapp.com']
      : ['localhost'],
  },
  
  // Headers for security (production)
  async headers() {
    if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
