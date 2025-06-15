import Redis from 'ioredis';

class RedisService {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor() {
    // First try external Redis URL, then localhost
    let config: any;
    
    if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://213.14.187.63:6379') {
      // Use working Redis URL if provided
      config = process.env.REDIS_URL;
    } else {
      // Use localhost Redis
      config = {
        host: 'localhost',
        port: 6379,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 2,
        lazyConnect: true,
        connectTimeout: 5000,
        enableOfflineQueue: false,
      };
    }

    this.client = new Redis(config);
    this.subscriber = new Redis(config);
    this.publisher = new Redis(config);

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    this.client.on('ready', () => {
      console.log('Redis client ready');
    });
  }

  // Basic operations
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Hash operations
  async hset(key: string, field: string, value: any): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    return value ? JSON.parse(value) : null;
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const hash = await this.client.hgetall(key);
    const result: Record<string, T> = {};
    
    for (const [field, value] of Object.entries(hash)) {
      result[field] = JSON.parse(value);
    }
    
    return result;
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  // List operations
  async lpush(key: string, value: any): Promise<void> {
    await this.client.lpush(key, JSON.stringify(value));
  }

  async rpush(key: string, value: any): Promise<void> {
    await this.client.rpush(key, JSON.stringify(value));
  }

  async lpop<T>(key: string): Promise<T | null> {
    const value = await this.client.lpop(key);
    return value ? JSON.parse(value) : null;
  }

  async rpop<T>(key: string): Promise<T | null> {
    const value = await this.client.rpop(key);
    return value ? JSON.parse(value) : null;
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const values = await this.client.lrange(key, start, stop);
    return values.map(value => JSON.parse(value));
  }

  // Set operations
  async sadd(key: string, member: any): Promise<void> {
    await this.client.sadd(key, JSON.stringify(member));
  }

  async srem(key: string, member: any): Promise<void> {
    await this.client.srem(key, JSON.stringify(member));
  }

  async smembers<T>(key: string): Promise<T[]> {
    const members = await this.client.smembers(key);
    return members.map(member => JSON.parse(member));
  }

  async sismember(key: string, member: any): Promise<boolean> {
    const result = await this.client.sismember(key, JSON.stringify(member));
    return result === 1;
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(JSON.parse(message));
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
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