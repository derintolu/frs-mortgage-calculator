import { v4wp } from "@kucrut/vite-for-wp";
import react from "@vitejs/plugin-react";
import path from "path";

export default {
  base: './',
  plugins: [
    v4wp({
      input: "src/widget/main.tsx",
      outDir: "assets/dist",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Build as a standalone widget that can be embedded anywhere
    rollupOptions: {
      output: {
        // Ensure consistent file names for embedding
        entryFileNames: 'assets/widget.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
};
