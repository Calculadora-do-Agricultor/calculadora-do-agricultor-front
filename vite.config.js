import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import * as path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
    // Otimização: reduzir extensões para melhorar resolução de imports
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  build: {
    // Otimização: configurar chunking manual para melhor cache
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas grandes em chunks próprios
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-label'],
          'icons-vendor': ['lucide-react', 'react-icons', '@heroicons/react'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
        }
      }
    },
    // Otimização: aumentar limite de warning para chunks grandes mas aceitáveis
    chunkSizeWarningLimit: 1000,
    // Otimização: minificação mais agressiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Otimização: configurar dependências para pré-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth', 
      'firebase/firestore',
      'lucide-react'
    ]
  },
  // Otimização: configurar servidor de desenvolvimento
  server: {
    // Warm up de arquivos frequentemente usados
    host: 'localhost', // Apenas interface local (sem múltiplos IPs de rede)
    hmr: true, // Enable HMR with default settings
    warmup: {
      clientFiles: [
        './src/App.jsx',
        './src/pages/Calculator/Calculator.jsx',
        './src/components/CalculationList/index.jsx',
        './src/components/Categories/index.jsx'
      ]
    }
  }
})