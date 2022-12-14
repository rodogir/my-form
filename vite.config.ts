import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(() => ({
	server: {
		port: 3700,
	},
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
			formats: ["es"],
		},
		rollupOptions: {
			external: ["react", "immer", "react/jsx-runtime"],
		},
	},
	define: { "import.meta.vitest": "undefined" },
	test: {
		include: ["lib/**/*.{test}.{ts,tsx}"],
		includeSource: ["lib/**/*.{ts,tsx}"],
	},
}));
