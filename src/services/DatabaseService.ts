import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

class DatabaseServiceClass {
  private prisma: PrismaClient;
  private connected = false;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }

  async initialize() {
    try {
      await this.prisma.$connect();
      this.connected = true;
      logger.info('Database connected');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async shutdown() {
    await this.prisma.$disconnect();
    this.connected = false;
  }

  // Project methods
  async saveProject(data: any) {
    return await this.prisma.project.create({
      data: {
        ...data,
        pages: JSON.stringify(data.pages),
        options: JSON.stringify(data.options),
      },
    });
  }

  async getProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (project) {
      project.pages = JSON.parse(project.pages as string);
      project.options = JSON.parse(project.options as string);
    }
    return project;
  }
  // A/B Testing methods
  async createABTest(data: any) {
    return await this.prisma.aBTest.create({
      data: {
        ...data,
        variants: JSON.stringify(data.variants),
        metrics: JSON.stringify(data.metrics),
      },
    });
  }

  async updateABTest(id: string, data: any) {
    return await this.prisma.aBTest.update({
      where: { id },
      data,
    });
  }

  async trackABTestEvent(data: {
    testId: string;
    variantId: string;
    eventType: string;
    metric?: string;
    timestamp: Date;
  }) {
    return await this.prisma.aBTestEvent.create({
      data,
    });
  }

  async getABTestEvents(testId: string) {
    return await this.prisma.aBTestEvent.findMany({
      where: { testId },
      orderBy: { timestamp: 'desc' },
    });
  }

  // Analytics methods
  async trackPageView(data: {
    projectId: string;
    page: string;
    visitor: string;
    timestamp: Date;
  }) {
    return await this.prisma.analytics.create({
      data: {
        ...data,
        event: 'pageview',
      },
    });
  }
}

export const DatabaseService = new DatabaseServiceClass();