// Cleanup utilities for server stability

export function startPeriodicCleanup() {
  // More frequent cleanup for Replit stability
  setInterval(() => {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Skip module cache cleanup in ESM environment to prevent errors
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 2 * 60 * 1000); // 2 minutes for better stability
}

export function optimizeNodeOptions() {
  // Set optimal Node.js options for Replit environment
  process.env.NODE_OPTIONS = '--max-old-space-size=512 --optimize-for-size --gc-interval=100 --max-semi-space-size=64';
}