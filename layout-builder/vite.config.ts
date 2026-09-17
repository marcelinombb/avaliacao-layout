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

export default defineConfig({
  plugins: [hbsPlugin()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
});
