// Memory monitoring and cleanup utilities

export function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  };
}

export function forceGarbageCollection() {
  if (global.gc) {
    global.gc();
  }
}

export function startMemoryMonitoring() {
  setInterval(() => {
    const memory = getMemoryUsage();
    
    // Log memory usage every 5 minutes
    console.log(`Memory: RSS ${memory.rss}MB, Heap ${memory.heapUsed}/${memory.heapTotal}MB`);
    
    // Force garbage collection if heap usage is high
    if (memory.heapUsed > 500) {
      console.log('High memory usage detected, forcing garbage collection');
      forceGarbageCollection();
    }
  }, 5 * 60 * 1000); // 5 minutes
}