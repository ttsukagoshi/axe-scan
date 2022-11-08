import ora from 'ora';

import { DEFAULT_CONFIG, ConfigValue } from './constants.js';

/**
 * ora - The elegant terminal spinner
 * @see https://www.npmjs.com/package/ora
 */
export const spinner = ora(); // New spinner
/**
 * Stops the spinner if it is spinning
 */
export const stopSpinner = function (): void {
  if (spinner.isSpinning) {
    spinner.stop();
  }
};

/**
 * Get contents of the config file.
 */
export const getConfig = function (): ConfigValue {
  // Check for config file axe-scan.config.json in the following order:
  // 1) in the current directory
  // 2) in the user's root directory
  // 3) if none of above, use the default configuration
  return DEFAULT_CONFIG;
};
