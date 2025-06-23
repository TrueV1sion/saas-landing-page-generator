import Bull, { Queue, Worker } from 'bullmq';
import { logger } from '../utils/logger';

export class QueueService {
  private static instance: QueueService;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  private constructor() {}

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  static async initialize(): Promise<void> {
    const instance = QueueService.getInstance();
    
    const connection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    };

    // Initialize queues
    instance.queues.set('page-generation', new Queue('page-generation', { connection }));
    instance.queues.set('deployment', new Queue('deployment', { connection }));
    instance.queues.set('analytics', new Queue('analytics', { connection }));

    logger.info('Queue service initialized');
  }

  static async shutdown(): Promise<void> {
    const instance = QueueService.getInstance();
    
    for (const [name, queue] of instance.queues) {
      await queue.close();
    }
    
    for (const [name, worker] of instance.workers) {
      await worker.close();
    }
    
    logger.info('Queue service shut down');
  }

  static getQueue(name: string): Queue | undefined {
    return QueueService.getInstance().queues.get(name);
  }
}