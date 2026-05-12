import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { runFormatChecks } from './checks/format.js';
import { runDataChecks } from './checks/data.js';
import { runHeaderParityChecks } from './checks/header-parity.js';
import { runCatalanChecks } from './checks/catalan.js';
import { runEnglishChecks } from './checks/english.js';

export type TestStatus = 'pass' | 'fail' | 'error' | 'warn';

export interface TestResult {
  id: string;
  description: string;
  status: TestStatus;
  details?: string;
}

export interface IntegritySummary {
  total: number;
  passed: number;
  failed: number;
  errored: number;
  warned: number;
}

export interface IntegrityRunResult {
  summary: IntegritySummary;
  results: TestResult[];
}

export interface IntegrityRunnerOptions {
  inputDir: string;
}

export function runIntegrityChecks(options: IntegrityRunnerOptions): IntegrityRunResult {
  const inputDir = resolve(options.inputDir);

  if (!existsSync(inputDir)) {
    const result: TestResult = {
      id: 'input-directory-exists',
      description: `Input directory exists: ${inputDir}`,
      status: 'fail',
      details: `Input directory not found: ${inputDir}`
    };

    return summarize([result]);
  }

  const results: TestResult[] = [
    ...runFormatChecks(inputDir),
    ...runHeaderParityChecks(inputDir),
    ...runDataChecks(inputDir),
    ...runCatalanChecks(inputDir),
    ...runEnglishChecks(inputDir),
  ];

  return summarize(results);
}

function summarize(results: TestResult[]): IntegrityRunResult {
  const summary: IntegritySummary = results.reduce<IntegritySummary>(
    (acc, result) => {
      acc.total += 1;
      if (result.status === 'pass') {
        acc.passed += 1;
      } else if (result.status === 'fail') {
        acc.failed += 1;
      } else if (result.status === 'error') {
        acc.errored += 1;
      } else if (result.status === 'warn') {
        acc.warned += 1;
      }
      return acc;
    },
    { total: 0, passed: 0, failed: 0, errored: 0, warned: 0 },
  );

  return { summary, results };
}

