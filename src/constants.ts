/**
 * Default configuration
 */
export interface ConfigValue {
  axeCoreTags: string[];
  resultTypes: string[];
  filePath: string;
  encoding: string;
  locale: string;
}
export const DEFAULT_CONFIG: ConfigValue = {
  axeCoreTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  resultTypes: ['incomplete', 'violations'],
  filePath: './urls.txt',
  encoding: 'utf8',
  locale: 'en',
};

/**
 * Header row of the `axe-scan run` output
 */
export const REPORT_HEADER = [
  'URL',
  'Rule Type', // rule ID
  'Result Type', // inapplicable, incomplete, passes, or violations
  'Rule Set', // wcag2aa etc.
  'Impact', // "minor", "moderate", "serious", or "critical"
  'Message',
  'HTML Element',
  'DOM Element',
  'Help',
  'Help URL',
  'WCAG criteria', // 1.4.3, 2.3.1, etc.
];
