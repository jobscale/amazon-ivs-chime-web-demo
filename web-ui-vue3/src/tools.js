import { Logger } from '@jobscale/logger';

const logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
export const logger = new Logger({ logLevel });

export default {
  logger,
};
