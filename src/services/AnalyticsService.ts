import { logger } from '../utils/logger';
import { DatabaseService } from './DatabaseService';

interface AnalyticsEvent {
  projectId: string;
  variantId?: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}

class AnalyticsServiceClass {
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  async initialize() {
    this.flushInterval = setInterval(() => this.flush(), 5000);
    logger.info('Analytics service initialized');
  }

  async track(event: AnalyticsEvent) {
    this.eventQueue.push(event);
    if (this.eventQueue.length >= 100) {
      await this.flush();
    }
  }

  private async flush() {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      // Process events in batches
      for (const event of events) {
        await DatabaseService.trackPageView({
          projectId: event.projectId,
          page: event.variantId || 'unknown',
          visitor: event.sessionId,
          timestamp: event.timestamp,
        });
      }
      logger.info(`Flushed ${events.length} events`);
    } catch (error) {
      logger.error('Analytics flush failed:', error);
      this.eventQueue.unshift(...events);
    }
  }
  async getMetrics(projectId: string, timeframe: 'day' | 'week' | 'month' = 'week') {
    // In production, this would query the database
    // For now, return mock metrics
    return {
      visitors: Math.floor(Math.random() * 10000),
      pageViews: Math.floor(Math.random() * 50000),
      conversionRate: Math.random() * 0.1,
      bounceRate: Math.random() * 0.5,
      avgSessionDuration: Math.floor(Math.random() * 300),
      topPages: [
        { page: 'home', views: Math.floor(Math.random() * 10000) },
        { page: 'features', views: Math.floor(Math.random() * 5000) },
        { page: 'pricing', views: Math.floor(Math.random() * 3000) },
      ],
    };
  }

  async shutdown() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
    logger.info('Analytics service shut down');
  }
}

export const AnalyticsService = new AnalyticsServiceClass();