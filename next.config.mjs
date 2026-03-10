import { execSync } from 'child_process';

// Get git info at build time
const getGitInfo = () => {
  try {
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const commitDate = execSync('git log -1 --format=%cd --date=short').toString().trim();
    return { commitHash, commitDate };
  } catch {
    return { commitHash: 'dev', commitDate: new Date().toISOString().split('T')[0] };
  }
};

const { commitHash, commitDate } = getGitInfo();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  skipTrailingSlashRedirect: true,
  env: {
    NEXT_PUBLIC_BUILD_VERSION: `1.0.0-${commitHash}`,
    NEXT_PUBLIC_BUILD_DATE: commitDate,
  },

  // BFF Pattern: Reverse proxy for Kratos to fix cookie domain mismatch
  // Production uses Kong Gateway at /identity
  // Local dev proxies /identity and /kratos directly to Kratos
  async rewrites() {
    const kratosUrl = process.env.KRATOS_PUBLIC_URL || 'http://kratos:4433';
    const kratosAdminUrl = process.env.KRATOS_ADMIN_URL || 'http://kratos:4434';

    return [
      // Primary path for production (via Kong Gateway)
      {
        source: '/identity/:path*',
        destination: `${kratosUrl}/:path*`,
      },
      {
        source: '/identity/admin/:path*',
        destination: `${kratosAdminUrl}/:path*`,
      },
      // Alternative path for development/legacy
      {
        source: '/kratos/:path*',
        destination: `${kratosUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
