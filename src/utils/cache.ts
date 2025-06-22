import Redis from 'ioredis';
import { logger } from './logger';

class CacheService {
  private client: Redis | null = null;
  private connected = false;
  private readonly defaultTTL = 3600;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      this.client.on('connect', () => {
        this.connected = true;
        logger.info('Redis connected');
      });
      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
        this.connected = false;
      });
    } catch (error) {
      logger.error('Redis init failed:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.connected || !this.client) return false;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttl || this.defaultTTL);
      return true;
    } catch (error) {
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.connected || !this.client) return false;    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  async flush(): Promise<void> {
    if (this.connected && this.client) {
      await this.client.flushdb();
    }
  }
}

// Export singleton instance
export const cache = new CacheService();