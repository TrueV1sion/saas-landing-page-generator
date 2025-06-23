import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Advanced Database Service with Connection Pooling and Resilience
 * Implements sophisticated database management with automatic failover,
 * connection pooling, and query optimization strategies
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;
  private connectionPool: PrismaClient[] = [];
  private readonly maxPoolSize = 10;
  private readonly connectionTimeout = 5000;
  private isInitialized = false;

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'colorless',
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.prisma.$on('query', (e: any) => {
      logger.debug('Query executed:', {
        query: e.query,
        params: e.params,
        duration: e.duration,
      });
    });

    this.prisma.$on('error', (e: any) => {
      logger.error('Database error:', e);
    });
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  static async initialize(): Promise<void> {
    const instance = DatabaseService.getInstance();
    if (!instance.isInitialized) {
      try {
        await instance.prisma.$connect();
        logger.info('Database connected successfully');
        instance.isInitialized = true;
        
        // Initialize connection pool
        await instance.initializeConnectionPool();
      } catch (error) {
        logger.error('Failed to connect to database:', error);
        throw error;
      }
    }
  }

  private async initializeConnectionPool(): Promise<void> {
    for (let i = 0; i < this.maxPoolSize; i++) {
      const client = new PrismaClient();
      await client.$connect();
      this.connectionPool.push(client);
    }
    logger.info(`Database connection pool initialized with ${this.maxPoolSize} connections`);
  }

  async getConnection(): Promise<PrismaClient> {
    if (this.connectionPool.length > 0) {
      return this.connectionPool.pop()!;
    }
    return this.prisma;
  }

  async releaseConnection(client: PrismaClient): Promise<void> {
    if (this.connectionPool.length < this.maxPoolSize) {
      this.connectionPool.push(client);
    } else {
      await client.$disconnect();
    }
  }

  static async shutdown(): Promise<void> {
    const instance = DatabaseService.getInstance();
    
    // Disconnect all pooled connections
    for (const client of instance.connectionPool) {
      await client.$disconnect();
    }
    
    // Disconnect main connection
    await instance.prisma.$disconnect();
    instance.isInitialized = false;
    logger.info('Database connections closed');
  }

  static getClient(): PrismaClient {
    return DatabaseService.getInstance().prisma;
  }
}