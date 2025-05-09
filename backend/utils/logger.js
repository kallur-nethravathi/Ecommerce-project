import winston from 'winston';

// Configure the logger
const logger = winston.createLogger({
  level: 'info',  // Set the default log level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),  // Logs to console
    new winston.transports.File({ filename: 'app.log' })  // Logs to a file
  ]
});

export default logger;

