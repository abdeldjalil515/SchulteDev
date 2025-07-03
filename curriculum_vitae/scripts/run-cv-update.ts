// run-cv-update.ts - Main entry point for CV update workflow

import fs from 'fs-extra';
import {
  CREATE_BACKUP,
  CvType,
  getCvFile,
  getCvTypesToProcess,
  getResponseFile,
  getTempFile,
  isGithubActions,
  setOutput
} from './config.js';
import logger from './logger.js';
import {extractLatex} from './claude-api.js';
import {main as transformFullRebuild} from './transform-full-rebuild.js';
import {main as transformIncremental} from './transform-incremental.js';

// Cleanup function
const cleanup = (): void => {
  const cvTypesToProcess = getCvTypesToProcess();
  for (const cvType of cvTypesToProcess) {
    const tempFile = getTempFile(cvType);
    const responseFile = getResponseFile(cvType);

    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    if (fs.existsSync(responseFile)) fs.unlinkSync(responseFile);
  }
};

// Validate LaTeX content
const validateLatex = (filePath: string, cvType: CvType): boolean => {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    logger.error(`${cvType} CV file is empty`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const required = ['\\documentclass', '\\begin{document}', '\\end{document}'];

  for (const element of required) {
    if (!content.includes(element)) {
      logger.error(`${cvType} CV missing ${element}`);
      return false;
    }
  }

  return true;
};

// Create backup if enabled
const createBackup = (cvFile: string, cvType: CvType): void => {
  if (!CREATE_BACKUP || !fs.pathExistsSync(cvFile)) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `${cvFile}.backup.${timestamp}`;

  try {
    fs.copySync(cvFile, backupFile);
    logger.info(`Backup created for ${cvType} CV: ${backupFile}`);
  } catch (error: any) {
    logger.warn(`Failed to create backup for ${cvType} CV, continuing without backup`);
  }
};

// Process a single CV type
const processCvType = (cvType: CvType): boolean => {
  const tempFile = getTempFile(cvType);
  const cvFile = getCvFile(cvType);
  const responseFile = getResponseFile(cvType);

  logger.info(`Processing ${cvType} CV...`);

  // Check if response file exists
  if (!fs.existsSync(responseFile) || fs.statSync(responseFile).size === 0) {
    logger.warn(`No response file found for ${cvType} CV, skipping`);
    return false;
  }

  // Extract and validate LaTeX
  if (!extractLatex(tempFile, cvType) || !validateLatex(tempFile, cvType)) {
    return false;
  }

  // Create backup and move to final location
  createBackup(cvFile, cvType);

  try {
    fs.renameSync(tempFile, cvFile);
    if (fs.existsSync(responseFile)) fs.unlinkSync(responseFile); // Cleanup
    logger.success(`${cvType} CV updated successfully!`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to finalize ${cvType} CV: ${error.message}`);
    return false;
  }
};

// Main function
const main = async (): Promise<void> => {
  try {
    // Validate CV types selection early
    const cvTypesToProcess = getCvTypesToProcess();
    logger.info(`Selected CV types: ${cvTypesToProcess.join(', ')}`);

    // Ensure tmp directory exists
    fs.ensureDirSync('tmp');

    // Set up cleanup on exit
    process.on('exit', () => cleanup());
    process.on('SIGINT', () => {
      cleanup();
      process.exit(1);
    });
    process.on('uncaughtException', (err: Error) => {
      logger.error(`Uncaught exception: ${err.message}`);
      cleanup();
      process.exit(1);
    });

    // Determine mode from GitHub inputs or default
    let mode: 'incremental' | 'full_rebuild' | 'skip' = 'incremental';
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      mode = (process.env.REBUILD_MODE as 'incremental' | 'full_rebuild') || 'incremental';
    }

    logger.info(`Starting CV update workflow in ${mode} mode for CV types: ${cvTypesToProcess.join(', ')}...`);

    // Validate mode
    if (mode !== 'incremental' && mode !== 'full_rebuild') {
      logger.error(`Invalid mode: ${mode}. Must be 'incremental' or 'full_rebuild'`);
      process.exit(1);
    }

    // Run the appropriate transformation
    if (mode === 'full_rebuild') {
      try {
        await transformFullRebuild();
        mode = 'full_rebuild';
      } catch (error: any) {
        logger.error('Full rebuild transformation failed');
        process.exit(1);
      }
    } else {
      // Clean up any existing response files first
      for (const cvType of cvTypesToProcess) {
        const responseFile = getResponseFile(cvType);
        if (fs.existsSync(responseFile)) fs.unlinkSync(responseFile);
      }

      try {
        await transformIncremental();
      } catch (error: any) {
        logger.error('Incremental transformation failed');
        process.exit(1);
      }

      // Check if any response files were created
      let hasAnyResponse = false;
      for (const cvType of cvTypesToProcess) {
        const responseFile = getResponseFile(cvType);
        if (fs.existsSync(responseFile) && fs.statSync(responseFile).size > 0) {
          hasAnyResponse = true;
          break;
        }
      }

      if (hasAnyResponse) {
        mode = 'incremental';
        logger.info('Response files found, proceeding with processing');
      } else {
        logger.info('No changes to process, skipping validation and compilation');
        if (isGithubActions()) {
          setOutput('mode', 'skip');
        }
        process.exit(0);
      }
    }

    // Process each CV type
    logger.info(`Processing responses for CV types: ${cvTypesToProcess.join(', ')}...`);
    let successCount = 0;
    for (const cvType of cvTypesToProcess) {
      if (processCvType(cvType)) {
        successCount++;
      }
    }

    if (successCount === 0) {
      logger.error('No CV files were successfully processed');
      process.exit(1);
    } else if (successCount < cvTypesToProcess.length) {
      logger.warn(`Only ${successCount}/${cvTypesToProcess.length} CV files were successfully processed`);
    }

    logger.success(`CV update completed successfully! Processed ${successCount}/${cvTypesToProcess.length} CV types`);
    logger.info(`Mode: ${mode}`);

    // Set outputs for GitHub Actions
    if (isGithubActions()) {
      setOutput('mode', mode);
      setOutput('processed_count', successCount.toString());
      setOutput('cv_types', cvTypesToProcess.join(','));
    }
  } catch (error: any) {
    logger.error(`Error in CV update: ${error.message}`);
    process.exit(1);
  }
};

// Run the main function
main().then(() => {
  logger.debug('CV update completed successfully');
}).catch(error => {
  logger.error(`Unhandled error in CV update: ${error.message}`);
  process.exit(1);
});
