import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@lib/form": resolve(__dirname, "lib/main"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.tsx"),
      name: "myForm",
      fileName: "form",
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
  test: {
    includeSource: ["lib/**/*.{ts,tsx}"],
  },
});
