// transform-full-rebuild.ts - Full CV rebuild

import {getCvTypesToProcess, setOutput} from './config.js';
import logger from './logger.js';
import {buildFullRebuildPrompt, processAllCvTypes, setupEnvironment} from './transform-utils.js';

export const main = async (): Promise<void> => {
  try {
    setupEnvironment();

    const types = getCvTypesToProcess();
    logger.info(`🏗️ Full rebuild for: ${types.join(', ')}`);
    setOutput('mode', 'full_rebuild');

    await processAllCvTypes(buildFullRebuildPrompt);

    logger.success(`All CVs processed: ${types.join(', ')}`);
  } catch (error: any) {
    logger.error(`Full rebuild error: ${error.message}`);
    throw error;
  }
};
