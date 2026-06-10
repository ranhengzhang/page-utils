import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(), // 暂时禁用，等待官方修复兼容性问题
    {
      name: 'proxy-middleware',
      configureServer(server) {
        server.middlewares.use('/api/proxy', async (req, res, next) => {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const targetUrl = url.searchParams.get('url');

          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
          }

          try {
            const response = await fetch(targetUrl, {
              headers: {
                'Referer': 'https://www.bilibili.com',
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
              },
            });

            res.statusCode = response.status;
            response.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });
            res.setHeader('Access-Control-Allow-Origin', '*');

            const buffer = Buffer.from(await response.arrayBuffer());
            res.end(buffer);
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Proxy failed', detail: error.message }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/bili': {
        target: 'https://api.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bili/, ''),
      },
    },
  },
})
