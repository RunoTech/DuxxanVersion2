import Redis from 'ioredis';
import { redisCircuitBreaker } from './circuit-breaker';

class RedisService {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;
  private isConnected: boolean = false;
  private performanceMetrics = {
    operationCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    startTime: Date.now()
  };

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    
    if (redisUrl) {
      console.log(`Redis connecting to: ${redisUrl.replace(/\/\/.*@/, '//***@')}`);
      
      const config = {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        connectTimeout: 2000,
        commandTimeout: 1000,
        retryDelayOnFailover: 100,
        enableOfflineQueue: false,
        family: 4,
        reconnectOnError: () => false, // Don't reconnect on errors
      };

      this.client = new Redis(redisUrl, config);
      this.subscriber = new Redis(redisUrl, { ...config, enableOfflineQueue: false });
      this.publisher = new Redis(redisUrl, { ...config, enableOfflineQueue: false });
    } else {
      console.warn('REDIS_URL not provided, Redis features will be disabled');
      // Create mock instances that always fail gracefully
      this.client = {} as Redis;
      this.subscriber = {} as Redis;
      this.publisher = {} as Redis;
    }

    this.setupEventHandlers();
    this.startMetricsCollection();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
      this.isConnected = false;
      this.performanceMetrics.errorCount++;
    });

    this.client.on('ready', () => {
      console.log('Redis client ready');
      this.isConnected = true;
    });

    this.client.on('close', () => {
      console.log('Redis connection closed');
      this.isConnected = false;
    });
  }

  private startMetricsCollection() {
    setInterval(() => {
      this.resetMetrics();
    }, 60000); // Reset metrics every minute
  }

  private resetMetrics() {
    this.performanceMetrics = {
      operationCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      startTime: Date.now()
    };
  }

  private async executeWithMetrics<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.performanceMetrics.operationCount++;
    
    try {
      const result = await redisCircuitBreaker.execute(operation);
      this.performanceMetrics.totalResponseTime += Date.now() - startTime;
      return result;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      throw error;
    }
  }

  getPerformanceMetrics() {
    const runtime = Date.now() - this.performanceMetrics.startTime;
    const avgResponseTime = this.performanceMetrics.operationCount > 0 
      ? this.performanceMetrics.totalResponseTime / this.performanceMetrics.operationCount 
      : 0;
    
    return {
      isConnected: this.isConnected,
      operationCount: this.performanceMetrics.operationCount,
      errorCount: this.performanceMetrics.errorCount,
      errorRate: this.performanceMetrics.operationCount > 0 
        ? (this.performanceMetrics.errorCount / this.performanceMetrics.operationCount) * 100 
        : 0,
      averageResponseTime: avgResponseTime,
      operationsPerSecond: runtime > 0 ? (this.performanceMetrics.operationCount / runtime) * 1000 : 0
    };
  }

  // Basic operations with fallback handling
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.del(key);
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  // Hash operations with fallback handling
  async hset(key: string, field: string, value: any): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.hset(key, field, JSON.stringify(value));
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    if (!this.isConnected) return {};
    
    try {
      const hash = await this.client.hgetall(key);
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      
      return result;
    } catch (error) {
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.hdel(key, field);
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  // List operations with fallback handling
  async lpush(key: string, value: any): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.lpush(key, JSON.stringify(value));
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  async rpush(key: string, value: any): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.rpush(key, JSON.stringify(value));
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  async lpop<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.lpop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  async rpop<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.rpop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    if (!this.isConnected) return [];
    
    try {
      const values = await this.client.lrange(key, start, stop);
      return values.map(value => JSON.parse(value));
    } catch (error) {
      return [];
    }
  }

  // Set operations with fallback handling
  async sadd(key: string, member: any): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.sadd(key, JSON.stringify(member));
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  async srem(key: string, member: any): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.srem(key, JSON.stringify(member));
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  async smembers<T>(key: string): Promise<T[]> {
    if (!this.isConnected) return [];
    
    try {
      const members = await this.client.smembers(key);
      return members.map(member => JSON.parse(member));
    } catch (error) {
      return [];
    }
  }

  async sismember(key: string, member: any): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.sismember(key, JSON.stringify(member));
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  // Pub/Sub operations with fallback handling
  async publish(channel: string, message: any): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.publisher.publish(channel, JSON.stringify(message));
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(JSON.parse(message));
        }
      });
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      // Fail silently when Redis is unavailable
    }
  }

  // Session management
  async setSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    await this.set(`session:${sessionId}`, sessionData, ttl);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Cache management
  async cacheRaffles(raffles: any[], ttl: number = 300): Promise<void> {
    await this.set('cache:raffles:active', raffles, ttl);
  }

  async getCachedRaffles<T>(): Promise<T[] | null> {
    return await this.get('cache:raffles:active');
  }

  async cacheDonations(donations: any[], ttl: number = 300): Promise<void> {
    await this.set('cache:donations:active', donations, ttl);
  }

  async getCachedDonations<T>(): Promise<T[] | null> {
    return await this.get('cache:donations:active');
  }

  async invalidateCache(pattern: string): Promise<void> {
    const keys = await this.client.keys(`cache:${pattern}*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number }> {
    const current = await this.client.incr(`rate_limit:${key}`);
    
    if (current === 1) {
      await this.client.expire(`rate_limit:${key}`, window);
    }
    
    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);
    
    return { allowed, remaining };
  }

  // Queue operations for job processing
  async addToQueue(queueName: string, job: any, priority: number = 0): Promise<void> {
    const jobData = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
      data: job,
      priority,
      createdAt: new Date().toISOString()
    };
    
    await this.client.zadd(`queue:${queueName}`, priority, JSON.stringify(jobData));
  }

  async getFromQueue<T>(queueName: string): Promise<T | null> {
    const result = await this.client.zpopmax(`queue:${queueName}`);
    if (result.length === 0) return null;
    
    return JSON.parse(result[0]);
  }

  async getQueueLength(queueName: string): Promise<number> {
    return await this.client.zcard(`queue:${queueName}`);
  }

  // Blockchain transaction tracking
  async trackTransaction(txHash: string, data: any): Promise<void> {
    await this.hset('blockchain:transactions', txHash, {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  }

  async updateTransactionStatus(txHash: string, status: string, blockNumber?: number): Promise<void> {
    const existing = await this.hget('blockchain:transactions', txHash);
    if (existing) {
      await this.hset('blockchain:transactions', txHash, {
        ...existing,
        status,
        blockNumber,
        updatedAt: new Date().toISOString()
      });
    }
  }

  async getTransaction<T>(txHash: string): Promise<T | null> {
    return await this.hget('blockchain:transactions', txHash);
  }

  // WebSocket connection tracking
  async addConnection(userId: number, socketId: string): Promise<void> {
    await this.sadd(`connections:user:${userId}`, socketId);
    await this.set(`connections:socket:${socketId}`, userId, 3600);
  }

  async removeConnection(userId: number, socketId: string): Promise<void> {
    await this.srem(`connections:user:${userId}`, socketId);
    await this.del(`connections:socket:${socketId}`);
  }

  async getUserConnections(userId: number): Promise<string[]> {
    return await this.smembers(`connections:user:${userId}`);
  }

  async getUserFromSocket(socketId: string): Promise<number | null> {
    return await this.get(`connections:socket:${socketId}`);
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    await Promise.all([
      this.client.disconnect(),
      this.subscriber.disconnect(),
      this.publisher.disconnect()
    ]);
    console.log('Redis connections closed');
  }
}

export const redis = new RedisService();
export default redis;