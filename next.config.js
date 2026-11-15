/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    '@mui/x-charts',
    '@mui/material-nextjs'
  ],
  async rewrites() {
    return [
      { source: '/User/:path*', destination: '/api/User/:path*' },
      { source: '/send-random-password', destination: '/api/send-random-password' },
      { source: '/Login', destination: '/login' },
      { source: '/Register', destination: '/register' },
      { source: '/DashBoard', destination: '/dashboard' },
      { source: '/Dashboard/Income', destination: '/dashboard/income' },
      { source: '/Dashboard/Expense', destination: '/dashboard/expense' },
      { source: '/Dashboard/Overview', destination: '/dashboard/overview' },
      { source: '/EditProfile', destination: '/edit-profile' },
      { source: '/forgetPassword', destination: '/forgot-password' }
    ];
  }
};

module.exports = nextConfig;
