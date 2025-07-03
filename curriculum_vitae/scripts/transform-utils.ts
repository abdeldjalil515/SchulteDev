// transform-utils.ts - Shared utilities for CV transformations

import fs from 'fs-extra';
import {simpleGit} from 'simple-git';
import {
  CAREER_FILE,
  CvType,
  DIFF_FILE,
  ensureDirectories,
  getCvFile,
  getCvTypesToProcess,
  GIT_DIFF_RANGE,
  setOutput
} from './config.js';
import logger from './logger.js';
import {callClaudeApi} from './claude-api.js';
import {getFullRebuildPrompt, getIncrementalPrompt} from './prompts.js';

const git = simpleGit();

// Common prompt building - now returns only user prompt
export const buildFullRebuildPrompt = (cvType: CvType): string => {
  if (!fs.existsSync(CAREER_FILE)) {
    throw new Error(`Career file not found: ${CAREER_FILE}`);
  }

  const careerData = fs.readFileSync(CAREER_FILE, 'utf8');
  return getFullRebuildPrompt(cvType, careerData);
};

export const buildIncrementalPrompt = (cvType: CvType): string => {
  const cvFile = getCvFile(cvType);

  if (!fs.existsSync(cvFile)) throw new Error(`CV file not found: ${cvFile}`);
  if (!fs.existsSync(DIFF_FILE)) throw new Error(`Diff file not found: ${DIFF_FILE}`);

  return getIncrementalPrompt(
    cvType,
    fs.readFileSync(cvFile, 'utf8'),
    fs.readFileSync(DIFF_FILE, 'utf8')
  );
};

// Git operations - GitHub Actions handles change detection
export const generateGitDiff = async (): Promise<boolean> => {
  try {
    // Extract relative path from CAREER_FILE (handles both absolute and relative paths)
    const relativePath = CAREER_FILE.includes('_data/career.md')
      ? '_data/career.md'
      : CAREER_FILE.replace(/^\.\.\//, '');

    const range = `HEAD~${GIT_DIFF_RANGE}`;

    logger.debug(`Generating git diff: ${range} HEAD -- ${relativePath}`);
    logger.debug(`CAREER_FILE: ${CAREER_FILE}`);

    // GitHub Actions already determined changes exist, just create the diff
    const diffResult = await git.diff([range, 'HEAD', '--', relativePath]);
    fs.writeFileSync(DIFF_FILE, diffResult);

    logger.debug(`Created diff file for ${relativePath}`);
    return true;
  } catch (error: any) {
    logger.error(`Git diff error: ${error.message}`);
    throw new Error(`Failed to generate git diff: ${error.message}`);
  }
};

export const validateDiffContent = (): boolean => {
  if (!fs.existsSync(DIFF_FILE)) {
    logger.info('ℹ️ No diff file found');
    setOutput('mode', 'skip');
    return false;
  }

  const diffContent = fs.readFileSync(DIFF_FILE, 'utf8');

  if (!diffContent?.trim() || diffContent === 'No changes detected in git diff') {
    if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
      logger.info('No changes but manual trigger - creating test diff');
      fs.writeFileSync(DIFF_FILE, '+ Minor update for testing incremental workflow');
      return true;
    } else {
      logger.info('ℹ️ No changes to process');
      setOutput('mode', 'skip');
      return false;
    }
  }

  return true;
};

// CV processing
export const processAllCvTypes = async (promptBuilder: (cvType: CvType) => string): Promise<void> => {
  const types = getCvTypesToProcess();

  for (const type of types) {
    logger.info(`Processing ${type} CV...`);
    const userPrompt = promptBuilder(type);

    if (await callClaudeApi(userPrompt, type)) {
      logger.success(`Processing complete for ${type} CV`);
    } else {
      throw new Error(`API call failed for ${type} CV`);
    }
  }

  logger.success('All CV types processed');
};

// Cleanup utilities
export const cleanupDiffFile = (): void => {
  if (fs.existsSync(DIFF_FILE)) {
    try {
      fs.removeSync(DIFF_FILE);
    } catch (e: any) {
      logger.error(`Failed to delete diff file: ${e.message}`);
    }
  }
};

export const setupEnvironment = (): void => {
  ensureDirectories();
};
