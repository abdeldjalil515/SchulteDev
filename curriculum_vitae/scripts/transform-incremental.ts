// transform-incremental.ts - Incremental CV updates

import {setOutput} from './config.js';
import logger from './logger.js';
import {
  buildIncrementalPrompt,
  cleanupDiffFile,
  generateGitDiff,
  processAllCvTypes,
  setupEnvironment,
  validateDiffContent
} from './transform-utils.js';

const handleManualTrigger = (): void => {
  if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
    if (process.env.REBUILD_MODE === 'full_rebuild') {
      setOutput('mode', 'full_rebuild');
      logger.info('🔄 Manual trigger: Switching to full rebuild');
      throw new Error('SWITCH_TO_FULL_REBUILD');
    }
    setOutput('mode', 'incremental');
    logger.info('📝 Manual trigger: Incremental mode');
  }
};

export const main = async (): Promise<void> => {
  try {
    setupEnvironment();
    logger.info('🔄 Starting incremental transformation...');

    handleManualTrigger();

    if (!await generateGitDiff()) return;
    if (!validateDiffContent()) return;

    await processAllCvTypes(buildIncrementalPrompt);

  } catch (error: any) {
    if (error.message === 'SWITCH_TO_FULL_REBUILD') throw error;
    logger.error(`Incremental error: ${error.message}`);
    throw error;
  } finally {
    cleanupDiffFile();
  }
};
