import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      brotliSize: true,
      gzipSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // Generate manifest for better caching
    manifest: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          // Router
          if (id.includes('react-router-dom')) {
            return 'router';
          }

          // Data fetching and state management
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }

          // UI Libraries - split into smaller chunks
          if (id.includes('@headlessui/react')) {
            return 'ui-core';
          }
          if (id.includes('lucide-react')) {
            return 'ui-icons';
          }

          // Charts - separate chunk for lazy loading
          if (id.includes('recharts')) {
            return 'charts';
          }

          // Supabase
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }

          // Utility libraries - split by category
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          if (id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'class-utils';
          }
          if (id.includes('zod')) {
            return 'validation';
          }

          // Form handling
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) {
            return 'forms';
          }

          // Notifications
          if (id.includes('react-hot-toast')) {
            return 'notifications';
          }

          // Large third-party libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Add content hash to filenames for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'recharts'
    ],
  },
  // Server configuration for development
  server: {
    hmr: {
      overlay: false
    },
    // Prevent caching issues in development
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  // Add cache busting for development
  define: mode === 'development' ? {
    __DEV_CACHE_BUST__: JSON.stringify(Date.now())
  } : {}
}));