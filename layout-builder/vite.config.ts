import { defineConfig } from 'vite';

const hbsPlugin = () => {
  return {
    name: 'hbs-plugin',
    transform(src: string, id: string) {
      if (id.endsWith('.hbs')) {
        return {
          code: `export default ${JSON.stringify(src)};`,
          map: null
        };
      }
    }
  };
};

import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    hbsPlugin(),
    {
      name: 'serve-outside-files',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/layout-output.json') {
            const filePath = path.resolve(__dirname, '../layout-output.json');
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'application/json');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          if (req.url === '/css/layout-avaliacao.css') {
            const cssPath = path.resolve(__dirname, '../public/css/layout-avaliacao.css');
            if (fs.existsSync(cssPath)) {
              res.setHeader('Content-Type', 'text/css');
              res.end(fs.readFileSync(cssPath));
              return;
            }
          }
          if (req.url === '/favicon.ico') {
            res.statusCode = 204;
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist'
  }
});
