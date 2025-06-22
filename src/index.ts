import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';
import { landingPageRouter } from './api/landingPageRouter';
import { analyticsRouter } from './api/analyticsRouter';
import { deploymentRouter } from './api/deploymentRouter';
import { templateRouter } from './api/templateRouter';
import { DatabaseService } from './services/DatabaseService';
import { QueueService } from './services/QueueService';
import { AIService } from './services/AIService';
import { AnalyticsService } from './services/AnalyticsService';

// Load environment variables
config();

// Initialize services
const initializeServices = async () => {
  try {
    await DatabaseService.initialize();
    await QueueService.initialize();
    await AIService.initialize();
    await AnalyticsService.initialize();
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Create Express application
const app: Application = express();
const server = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API Routes
app.use('/api/landing-pages', authMiddleware, landingPageRouter);
app.use('/api/analytics', authMiddleware, analyticsRouter);
app.use('/api/deployments', authMiddleware, deploymentRouter);
app.use('/api/templates', templateRouter); // Public access for browsing templates

// Static files for generated landing pages
app.use('/preview', express.static('generated/preview'));
app.use('/live', express.static('generated/live'));

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await initializeServices();
  
  server.listen(PORT, () => {
    logger.info(`🚀 SaaS Landing Page Generator running on port ${PORT}`);
    logger.info(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    logger.info(`🔧 API Docs: http://localhost:${PORT}/api-docs`);
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await QueueService.shutdown();
  await DatabaseService.shutdown();
  process.exit(0);
});

// Start the application
startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export { app, server };