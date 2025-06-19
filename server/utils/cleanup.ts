// Cleanup utilities for server stability

export function startPeriodicCleanup() {
  // Clean up every 5 minutes for better stability
  setInterval(() => {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

export function optimizeNodeOptions() {
  // Set optimal Node.js options for stability in Replit environment
  process.env.NODE_OPTIONS = '--max-old-space-size=256 --optimize-for-size --gc-interval=100';
}