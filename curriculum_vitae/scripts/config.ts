// config.ts - Central configuration for CV generation scripts

import fs from 'fs-extra';
import { z } from 'zod';
import * as core from '@actions/core';

// Zod schema for environment variables
const EnvSchema = z.object({
  CAREER_FILE: z.string().default('../../_data/career.md'),
  API_MODEL: z.string().default('claude-sonnet-4-20250514'),
  MAX_TOKENS: z.coerce.number().positive().default(12000),
  MIN_CONTENT_LENGTH: z.coerce.number().positive().default(500),
  GIT_DIFF_RANGE: z.coerce.number().positive().default(1),
  CREATE_BACKUP: z.coerce.boolean().default(false),
  CV_TYPES: z.string().default('professional,anti'),
  GITHUB_ACTIONS: z.coerce.boolean().default(false),
});

// Parse and validate environment variables
const env = EnvSchema.parse(process.env);

// File paths
export const CAREER_FILE: string = env.CAREER_FILE;
export const PROFESSIONAL_CV_FILE: string = '../markus-schulte-dev-professional-cv.tex';
export const ANTI_CV_FILE: string = '../markus-schulte-dev-anti-cv.tex';
export const DIFF_FILE: string = 'tmp/career_changes.diff';

// API Configuration
export const API_MODEL: string = env.API_MODEL;
export const MAX_TOKENS: number = env.MAX_TOKENS;
export const MIN_CONTENT_LENGTH: number = env.MIN_CONTENT_LENGTH;

// Git diff range for incremental updates
export const GIT_DIFF_RANGE: number = env.GIT_DIFF_RANGE;

// CV Types
export type CvType = 'professional' | 'anti';

// Settings
export const CREATE_BACKUP: boolean = env.CREATE_BACKUP;

// Simple getters
export const getCvFile = (cvType: CvType): string =>
  cvType === 'professional' ? PROFESSIONAL_CV_FILE : ANTI_CV_FILE;

export const getResponseFile = (cvType: CvType): string =>
  `tmp/response_${cvType}.json`;

export const getTempFile = (cvType: CvType): string =>
  `tmp/temp_${cvType}.tex`;

export const getCvTypesToProcess = (): CvType[] => {
  return env.CV_TYPES.split(',').map(type => type.trim()) as CvType[];
};

// Environment checks
export const isGithubActions = (): boolean => env.GITHUB_ACTIONS;

// GitHub Actions output function using @actions/core
export const setOutput = (name: string, value: string): void => {
  if (isGithubActions()) {
    core.setOutput(name, value);
  } else {
    console.log(`Output: ${name}=${value}`);
  }
};

// Directory management
export const ensureDirectories = (): void => {
  fs.ensureDirSync('tmp');
};
