import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            // Proxy API requests to the Express server
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
});
