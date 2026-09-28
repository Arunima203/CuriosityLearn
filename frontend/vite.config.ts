import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/countries": {
        target: "https://api.restcountries.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/countries/, "/countries/v5"),
      },
    },
  },
});