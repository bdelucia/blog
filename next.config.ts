import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pub-22e36f870e1647a6a48e07c2fa9d9ae8.r2.dev",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cukwaunnlbotdvmvaskx.supabase.co",
                port: "",
                pathname: "/storage/v1/object/public/**",
            },
        ],
        qualities: [75, 95],
    },
};

export default nextConfig;
