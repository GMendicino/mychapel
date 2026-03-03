import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import busboy from 'busboy';
import sharp from 'sharp';

// Custom plugin to handle image saving
const saveImagePlugin = () => ({
  name: 'save-image-plugin',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/api/save-image', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (req.method === 'POST') {
        const bb = busboy({ headers: req.headers });

        bb.on('file', (_name, file, info) => {
          const { filename } = info;
          const saveDir = path.resolve(process.cwd(), 'public/SavedImages');

          if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
          }

          const filePath = path.join(saveDir, filename);
          const writeStream = fs.createWriteStream(filePath);

          // Create sharp pipeline: resize to max width 6400px, maintain aspect ratio, do not enlarge
          const transform = sharp()
            .resize({ width: 6000, withoutEnlargement: true });

          file.pipe(transform).pipe(writeStream);

          writeStream.on('finish', () => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: `/SavedImages/${filename}` }));
          });

          writeStream.on('error', (err) => {
            console.error('File write error:', err);
            res.statusCode = 500;
            res.end('File write failed');
          });
        });

        bb.on('error', (err) => {
          console.error('Busboy error:', err);
          res.statusCode = 500;
          res.end('Upload failed');
        });

        req.pipe(bb);
      } else {
        next();
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "./" : "/",
  plugins: [react(), saveImagePlugin()],
}))
