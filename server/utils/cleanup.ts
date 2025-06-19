// Cleanup utilities for server stability

export function startPeriodicCleanup() {
  // Clean up every 10 minutes
  setInterval(() => {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('Periodic garbage collection completed');
      }
      
      // Clear any cached data that might accumulate
      if (process.env.NODE_ENV === 'development') {
        delete require.cache[require.resolve('../storage')];
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 10 * 60 * 1000); // 10 minutes
}

export function optimizeNodeOptions() {
  // Set optimal Node.js options for stability
  process.env.NODE_OPTIONS = '--max-old-space-size=512 --optimize-for-size';
}