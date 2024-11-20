import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import fs from "fs";
import uikitPkg from "./package.json";
// Add these imports
import { visualizer } from "rollup-plugin-visualizer";

const isHttps = process.env?.HTTPS === "true";
const useVisualizer = process.env?.VITE_USE_VISUALIZER === "true";
const isProduction = process.env.NODE_ENV === "production";
console.log("NODE_ENV", process.env.NODE_ENV);
console.log("isHttps", isHttps);
console.log("useVisualizer", useVisualizer);
console.log("isProduction", isProduction);

let outputConfig;
const productionConfig = {
  lib: {
    entry: path.resolve(__dirname, "src/main.tsx"),
    name: "output",
    formats: ["es", "umd"],
    fileName: (format) => `output.min.${format}.js`,
  },
  rollupOptions: {
    // external: ["react", "react-dom"],
    output: {
      // globals: {
      //   react: "React",
      //   "react-dom": "ReactDOM",
      // },
      // Ensure proper UMD build
      // umdNamedDefine: true,
      assetFileNames: (assetInfo) => {
        if (assetInfo.name === "style.css") return "output.css";
        return assetInfo.name;
      },
    },
  },
  cssCodeSplit: false, // This ensures all CSS is bundled into a single file
  commonjsOptions: {
    include: [/react-virtualized/, /node_modules/],
  },
};

const devConfig = {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, "index.html"), // Use index.html as entry point
    },
    output: {
      // Ensure proper chunking
      entryFileNames: "assets/[name].[hash].js",
      chunkFileNames: "assets/[name].[hash].js",
      assetFileNames: isProduction
        ? (assetInfo) => {
            if (assetInfo.name === "style.css") return "output.css";
            return assetInfo.name;
          }
        : "assets/[name].[hash][extname]",
    },
  },
  // Enable source maps for better debugging
  sourcemap: !isProduction,
  // Other build options remain the same
  cssCodeSplit: false,
  commonjsOptions: {
    include: [/react-virtualized/, /node_modules/],
  },
  chunkSizeWarningLimit: 2000,
  outDir: useVisualizer ? "dist-visualizer" : "dist",
};

const visualizerConfig = {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, "index.html"), // Use index.html as entry point
    },
    output: {
      // Ensure proper chunking
      entryFileNames: "[name].[hash].js",
      chunkFileNames: "[name].[hash].js",
      assetFileNames: isProduction
        ? (assetInfo) => {
            if (assetInfo.name === "style.css") return "output.css";
            return assetInfo.name;
          }
        : "[name].[hash][extname]",
    },
  },
  // Enable source maps for better debugging
  sourcemap: false,
  // Other build options remain the same
  cssCodeSplit: false,
  commonjsOptions: {
    include: [/react-virtualized/, /node_modules/],
  },
  chunkSizeWarningLimit: 2000,
  outDir: "dist-visualizer",
};

if (isProduction) {
  outputConfig = productionConfig;
} else if (!isProduction && useVisualizer) {
  outputConfig = visualizerConfig;
} else {
  outputConfig = devConfig;
}

console.log("outputConfig", outputConfig);

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: "public",
  plugins: [
    react(),
    svgr({
      include: "**/*.svg",
      svgrOptions: {
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  convertShapeToPath: false,
                },
              },
            },
            "prefixIds",
          ],
        },
      },
    }),
    // Add these plugins
    useVisualizer &&
      visualizer({
        filename: "stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  build: outputConfig,
  server: {
    host: "0.0.0.0",
    port: isHttps ? 443 : 5001,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    cors: true,
    https: isHttps
      ? {
          key: fs.readFileSync("localhost+2-key.pem"),
          cert: fs.readFileSync("localhost+2.pem"),
        }
      : undefined,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "prop-types": "prop-types/prop-types.js",
      "react-virtualized": "react-virtualized/dist/umd/react-virtualized.js",
    },
  },
  optimizeDeps: {
    include: ["prop-types", "regenerator-runtime/runtime"],
    exclude: ["name-of-problematic-dependency"],
  },
  define: {
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      UIKIT_VERSION: JSON.stringify(uikitPkg.version),
    },
  },
  css: {
    devSourcemap: true,
  },
});
