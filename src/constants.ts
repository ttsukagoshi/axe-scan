import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readPackageUpSync } from 'read-pkg-up';

/**
 * Package Info
 */
export const __dirname: string = dirname(fileURLToPath(import.meta.url));
const manifest = readPackageUpSync({ cwd: __dirname });
export const [PACKAGE_NAME, PACKAGE_DESC, VERSION] = manifest
  ? [
      manifest.packageJson.name,
      manifest.packageJson.description,
      manifest.packageJson.version,
    ]
  : ['unknown', 'unknown', 'unknown'];

/**
 * Default configuration
 */
export type ConfigValue = {
  axeCoreTags: string[]; // See https://www.deque.com/axe/core-documentation/api-documentation/#user-content-axe-core-tags for possible values
  resultTypes: string[]; // Possible values are elements of RESULT_TYPES_FULL_SET
  filePath: string;
  locale: string;
};
export const DEFAULT_LOCALE = 'en';
export const DEFAULT_CONFIG: ConfigValue = {
  axeCoreTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  resultTypes: ['incomplete', 'violations'],
  filePath: './urls.txt',
  locale: `${DEFAULT_LOCALE}`,
};
export const RESULT_TYPES_FULL_SET = [
  // Full set of the values that resultTypes in ConfigValue can take
  'violations',
  'incomplete',
  'inapplicable',
  'passes',
];
export const CONFIG_FILE_PATH = 'axe-scan.config.json';

/**
 * Header row of the `axe-scan run` output
 */
export type ReportRowValue = {
  [key: string]: string;
};
export const REPORT_HEADER: string[] = [
  'URL',
  'Rule Type', // rule ID
  'Result Type', // inapplicable, incomplete, passes, or violations
  'Result Condition', // all, none, or any
  'Result Condition Index', // results with the same index have the common result conditions
  'Rule Set', // wcag2aa etc.
  'Impact', // "minor", "moderate", "serious", or "critical"
  'Message',
  'HTML Element',
  'DOM Element',
  'Help',
  'Help URL',
  'WCAG Criteria', // WCAG success criteria
  'axe-scan Version',
];

/**
 * Header row of the `axe-scan summary` output
 */
export const SUMMARY_HEADER: string[] = [
  'URL',
  'WCAG Criteria', // 1.4.3, 2.3.1, etc.
  'WCAG Level', // AAA, AA, or A
  'Result',
  'axe-scan Version',
];
