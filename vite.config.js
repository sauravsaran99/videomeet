import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: "192.168.1.52", // This makes the app accessible on your local network
    port: 3000, // Optionally specify a custom port (you can change this)
  },
});
