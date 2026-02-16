import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   caseSensitiveRoutes: true
  // },
};

export default nextConfig;
export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/patient/:path*'],
};

// module.exports = {
//   experimental: {
//     caseSensitiveRoutes: true
//   }
// }