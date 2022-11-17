import axe from 'axe-core';
import fs from 'fs';
import ora from 'ora';
import os from 'os';
import path from 'path';

import { DEFAULT_CONFIG, CONFIG_FILE_PATH, ConfigValue } from './constants.js';

/**
 * ora - The elegant terminal spinner
 * @see https://www.npmjs.com/package/ora
 */
export const spinner = ora(); // New spinner
/**
 * Stops the spinner if it is spinning
 */
export function stopSpinner(): void {
  if (spinner.isSpinning) {
    spinner.stop();
  }
}

export interface PartialAxeResults {
  passes: axe.Result[];
  violations: axe.Result[];
  incomplete: axe.Result[];
  inapplicable: axe.Result[];
}

export enum StartDirValue {
  CURRENT = 'current',
  HOME = 'home',
}

export const CONFIG_FILE_PATH_HOME = path.join(os.homedir(), CONFIG_FILE_PATH);

/**
 * Get contents of the config file in the order of:
 * current directory -> home directory
 * Falls back to the default settings when no `axe-scan.config.json` is found.
 * @param startDir The starting directory to find an existing config file.
 * Accepts either 'current' or 'home', indicating the user's current directory
 * and home directory, respectively.
 * @return Config values defaulting to the default settings
 * when no `axe-scan.config.json` is found.
 */
export function getConfig(
  startDir: StartDirValue = StartDirValue.CURRENT
): ConfigValue {
  if (fs.existsSync(CONFIG_FILE_PATH) && startDir === StartDirValue.CURRENT) {
    // Check for config file in the current directory
    return extendConfig(
      JSON.parse(fs.readFileSync(CONFIG_FILE_PATH).toString())
    );
  } else if (
    fs.existsSync(CONFIG_FILE_PATH_HOME) &&
    startDir === StartDirValue.HOME
  ) {
    // Check for config file in the user's home directory
    return extendConfig(
      JSON.parse(
        fs.readFileSync(`${os.homedir()}/${CONFIG_FILE_PATH}`).toString()
      )
    );
  } else {
    // if none of above, use the default configuration
    return DEFAULT_CONFIG;
  }
}

/**
 * Fill in the missing key-value sets in the config values set manually by the user
 * make a full ConfigValue object
 * @param config The ConfigValue object, possibly partial, designated by the user.
 * @returns The full ConfigValue object.
 */
function extendConfig(config: Partial<ConfigValue>): ConfigValue {
  return Object.assign(DEFAULT_CONFIG, config);
}
