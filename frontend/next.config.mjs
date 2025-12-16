/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },

  // Compression
  compress: true,

  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Experimental features for better performance
  // experimental: {
  //   optimizeCss: true, // Requires critters package
  // },

  // Bundle analyzer (uncomment to analyze)
  // webpack: (config, { isServer }) => {
  //   if (!isServer && process.env.ANALYZE === 'true') {
  //     const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: 'static',
  //         reportFilename: '../analyze/client.html',
  //       })
  //     );
  //   }
  //   return config;
  // },
};

export default nextConfig;






