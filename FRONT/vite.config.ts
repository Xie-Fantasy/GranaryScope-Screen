import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/
export default defineConfig({
  plugins: [
    vue(),
    viteMockServe({
      mockPath: 'src/mock',
      enable: true,
      logger: true,
      // 只加载唯一的 Mock 入口，避免历史 JS 副本或数据生成器被当作路由文件扫描。
      ignore: /^(?!index\.ts$).*/,
    } as Parameters<typeof viteMockServe>[0]) as unknown as Plugin,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 全局 SCSS 变量自动注入（使用 @forward 兼容新语法）
        additionalData: `@use '@/styles/variables.scss' as *;`,
        // 消除 Sass 弃用警告
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
  server: {
    host: '0.0.0.0',
    // 前端开发服务固定使用 2355；端口被占用时直接报错，避免误以为仍在使用旧端口。
    port: 2355,
    strictPort: true,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/echarts')) {
            return 'echarts'
          }
        },
      },
    },
  },
})
