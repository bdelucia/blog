import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pub-22e36f870e1647a6a48e07c2fa9d9ae8.r2.dev",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
