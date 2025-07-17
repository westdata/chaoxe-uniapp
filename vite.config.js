import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  base: '/chaoxe-web/', // 配置打包路径
  plugins: [
    uni(),
  ],
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://chyxe.cn/chaoxe-api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
