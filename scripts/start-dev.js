#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting development servers...\n");

// Start Express server
const expressServer = spawn("node", ["server/index.js"], {
    stdio: "pipe",
    cwd: path.join(__dirname, ".."),
});

expressServer.stdout.on("data", (data) => {
    console.log(`[Express] ${data.toString().trim()}`);
});

expressServer.stderr.on("data", (data) => {
    console.error(`[Express Error] ${data.toString().trim()}`);
});

// Start Vite dev server
const viteServer = spawn("pnpm", ["run", "dev"], {
    stdio: "pipe",
    cwd: path.join(__dirname, ".."),
    shell: true,
});

viteServer.stdout.on("data", (data) => {
    console.log(`[Vite] ${data.toString().trim()}`);
});

viteServer.stderr.on("data", (data) => {
    console.error(`[Vite Error] ${data.toString().trim()}`);
});

// Handle process termination
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down servers...");
    expressServer.kill();
    viteServer.kill();
    process.exit(0);
});

// Check if servers are running
setTimeout(() => {
    console.log("\n✅ Development servers should be running:");
    console.log("   Frontend: http://localhost:5173");
    console.log("   Backend:  http://localhost:3000");
    console.log("   API:      http://localhost:3000/api");
    console.log("\nPress Ctrl+C to stop both servers\n");
}, 3000);
