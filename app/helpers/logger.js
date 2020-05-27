const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // log only if level less than or equal to this level
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'warn.log', level: 'warn'}),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// also log to console when not in production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}


module.exports = logger;