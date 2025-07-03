// logger.ts - Simple logging with Consola

import consola from 'consola';

// Get DEBUG setting directly from environment to avoid circular dependency
const DEBUG = process.env.DEBUG === 'true';

const logger = consola.create({
  level: DEBUG ? 5 : 3, // 5 = debug, 3 = info
});

export default logger;
