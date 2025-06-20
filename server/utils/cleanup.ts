// Cleanup utilities for server stability

export function startPeriodicCleanup() {
  // More frequent cleanup for Replit stability
  setInterval(() => {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Clear Node.js cache periodically to prevent memory leaks
      const moduleCache = require.cache;
      const cacheSize = Object.keys(moduleCache).length;
      
      if (cacheSize > 1000) {
        console.log(`Large module cache detected (${cacheSize} modules), clearing non-essential modules`);
        // Only clear non-essential cached modules
        Object.keys(moduleCache).forEach(key => {
          if (key.includes('node_modules') && !key.includes('express') && !key.includes('drizzle')) {
            delete moduleCache[key];
          }
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 2 * 60 * 1000); // 2 minutes for better stability
}

export function optimizeNodeOptions() {
  // Set optimal Node.js options for Replit environment
  process.env.NODE_OPTIONS = '--max-old-space-size=512 --optimize-for-size --gc-interval=100 --max-semi-space-size=64';
}