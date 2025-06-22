import winston from 'winston';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'white',
};

winston.addColors(colors);

// Console format
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Create a stream object for Morgan middleware
export const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

// Export convenience methods
export const logError = (error: Error, context?: string) => {
  logger.error(`${context || 'Error'}: ${error.message}`, { stack: error.stack });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};