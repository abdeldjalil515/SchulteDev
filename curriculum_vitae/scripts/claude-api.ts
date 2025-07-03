// claude-api.ts - Claude API integration

import fs from 'fs-extra';
import Anthropic from '@anthropic-ai/sdk';
import {MessageCreateParams, TextBlock} from '@anthropic-ai/sdk/resources';
import {
  API_MODEL,
  CvType,
  getCvFile,
  getResponseFile,
  MAX_TOKENS,
  MIN_CONTENT_LENGTH
} from './config.js';
import logger from './logger.js';

// Mock response generation
const createMockResponse = (cvType: CvType): void => {
  const responseFile = getResponseFile(cvType);
  if (fs.existsSync(responseFile)) return;

  logger.info(`Creating mock response for ${cvType} CV`);

  const cvFile = getCvFile(cvType);
  let content: string;

  if (fs.pathExistsSync(cvFile)) {
    content = fs.readFileSync(cvFile, 'utf8');
    logger.info(`Using existing ${cvType} CV content`);
  } else {
    content = generateDefaultMockContent();
    logger.info(`Using generic mock for ${cvType} CV`);
  }

  fs.writeJsonSync(responseFile, {
    content: [{type: "text", text: content}]
  }, {spaces: 2});
};

const generateDefaultMockContent = (): string => `
\\documentclass{article}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{lastpage}
\\begin{document}
\\title{Mock CV}
\\author{Test User}
\\date{\\today}
\\maketitle
\\section{Education}
\\begin{itemize}
\\item PhD Computer Science, Test University, 2020
\\item MS Computer Science, Test University, 2018
\\item BS Computer Science, Test University, 2016
\\end{itemize}
\\section{Experience}
\\begin{itemize}
\\item Senior Developer, Test Company, 2020-Present
\\item Developer, Another Company, 2018-2020
\\item Intern, Yet Another Company, 2016-2018
\\end{itemize}
\\end{document}`.trim();

const logClaudeResponse = (response: any, cvType: CvType, userPrompt: string): void => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = `tmp/claude-response-${cvType}-${timestamp}.json`;
  fs.writeJsonSync(logFile, {
    timestamp: new Date().toISOString(),
    cvType,
    model: API_MODEL,
    request: {
      userPrompt: userPrompt.slice(0, 200) + (userPrompt.length > 200 ? '...' : ''),
      maxTokens: MAX_TOKENS
    },
    response
  }, {spaces: 2});
  logger.debug(`Claude response logged to ${logFile}`);
};

// API call logic
const shouldUseMock = (): { useMock: boolean; reason: string } => {
  if (process.env.SKIP_API === 'true') {
    return {useMock: true, reason: 'SKIP_API=true'};
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return {useMock: true, reason: 'No API key'};
  }
  return {useMock: false, reason: ''};
};

const handleStreamingResponse = async (stream: any): Promise<{ content: string; usage: any }> => {
  let completeResponse = '';
  let usage = null;

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      completeResponse += chunk.delta.text;
    } else if (chunk.type === 'message_delta' && chunk.usage) {
      usage = chunk.usage;
    }
  }

  return {content: completeResponse, usage};
};

const callApi = async (userPrompt: string, cvType: CvType): Promise<boolean> => {
  logger.info(`Calling Claude API for ${cvType} CV with user prompt only...`);
  logger.debug(`Model: ${API_MODEL}`);

  try {
    const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});

    const request: MessageCreateParams = {
      model: API_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{role: 'user', content: userPrompt}],
      stream: true,  // Enable streaming for extended thinking
      thinking: {
        type: "enabled",
        budget_tokens: Math.min(20000, Math.floor(MAX_TOKENS * 0.4))  // Reduced thinking budget to 40%, more for content
      }
    };

    logger.debug('Starting streaming response...');
    const stream = await anthropic.messages.create(request);

    const {content: completeResponse, usage} = await handleStreamingResponse(stream);

    const response = {
      content: [{type: 'text', text: completeResponse}],
      usage: usage
    };

    const responseFile = getResponseFile(cvType);
    fs.writeJsonSync(responseFile, response, {spaces: 2});

    logClaudeResponse(response, cvType, userPrompt);

    if (!completeResponse?.trim()) {
      logger.error(`Invalid API response for ${cvType} CV: empty response`);
      return false;
    }

    logger.success(`API response received for ${cvType} CV`);
    logger.debug(`Response length: ${completeResponse.length} chars`);
    return true;
  } catch (error: any) {
    logger.error(`API call failed for ${cvType} CV: ${error.message}`);
    if (error.response) {
      logger.error('Response:', JSON.stringify(error.response).slice(0, 500));
    }
    return false;
  }
};

export const callClaudeApi = async (userPrompt: string, cvType: CvType): Promise<boolean> => {
  const {useMock, reason} = shouldUseMock();

  if (useMock) {
    logger.info(`${reason}, using mock for ${cvType} CV`);
    createMockResponse(cvType);
    return true;
  }

  if (!userPrompt) {
    logger.error('No user prompt provided');
    return false;
  }

  return callApi(userPrompt, cvType);
};

// Content processing
const readResponseContent = (responseFile: string, cvType: CvType): string | null => {
  try {
    logger.debug(`Reading response from ${responseFile} for ${cvType} CV`);

    if (!fs.existsSync(responseFile)) {
      logger.error(`Response file not found: ${responseFile}`);
      return null;
    }

    const data = fs.readJsonSync(responseFile);

    if (!data.content?.[0] || data.content[0].type !== 'text') {
      logger.error(`Invalid response content for ${cvType} CV`);
      return null;
    }

    return (data.content[0] as TextBlock).text;
  } catch (error: any) {
    logger.error(`Failed to read response for ${cvType} CV: ${error.message}`);
    if (error instanceof SyntaxError) {
      logger.error('Invalid JSON in response file');
    }
    return null;
  }
};

const cleanLatexContent = (text: string, cvType: CvType): string => {
  const originalLength = text.length;

  // Remove thinking blocks and code fences
  text = text.replace(/<(extended_)?thinking>[\s\S]*?<\/(extended_)?thinking>/gi, '');
  text = text.replace(/```(latex)?\n?/gi, '');
  text = text.trim().replace(/\n{3,}/g, '\n\n');

  const cleanedChars = originalLength - text.length;
  if (cleanedChars > 0) {
    logger.debug(`Cleaned ${cleanedChars} chars from ${cvType} CV`);
  }

  return text;
};

const validateContent = (text: string, cvType: CvType): boolean => {
  if (text.length < MIN_CONTENT_LENGTH) {
    logger.error(`Content too short for ${cvType} CV (${text.length} < ${MIN_CONTENT_LENGTH})`);
    return false;
  }
  return true;
};

export const extractLatex = (outputFile: string, cvType: CvType): boolean => {
  if (!outputFile) {
    logger.error('No output file specified');
    return false;
  }

  const responseFile = getResponseFile(cvType);
  const rawText = readResponseContent(responseFile, cvType);
  if (!rawText) return false;

  logger.debug(`Raw response length for ${cvType} CV: ${rawText.length} chars`);

  const cleanedText = cleanLatexContent(rawText, cvType);
  if (!validateContent(cleanedText, cvType)) return false;

  try {
    fs.writeFileSync(outputFile, cleanedText);
    logger.debug(`Wrote ${cleanedText.length} chars to ${outputFile} for ${cvType} CV`);
    logger.success(`Extracted LuaLaTeX for ${cvType} CV`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to write output file for ${cvType} CV: ${error.message}`);
    return false;
  }
};
