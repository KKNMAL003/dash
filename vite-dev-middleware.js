// Development middleware to prevent caching
export default function devCacheBuster() {
  return {
    name: 'dev-cache-buster',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Add aggressive no-cache headers for all requests in development
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        next();
      });
    }
  };
}
