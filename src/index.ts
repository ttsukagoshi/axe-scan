#!/usr/bin/env node

import loudRejection from 'loud-rejection';
import { program } from 'commander';

// Local imports
import { AxeScanError } from './axe-scan-error.js';
import {
  CONFIG_FILE_PATH,
  PACKAGE_NAME,
  PACKAGE_DESC,
  VERSION,
} from './constants.js';
import { spinner, stopSpinner } from './utils.js';
// Subcommands
import init from './commands/init.js';
import run from './commands/run.js';
import summary from './commands/summary.js';

// Make unhandled promise rejections fail loudly instead of the default silent fail
loudRejection();

/**
 * Set global CLI configurations
 */
program.storeOptionsAsProperties(false);

/**
 * Displays axe-scan version
 */
program.version(VERSION, '-v, --version', 'output the current version');
program
  .name(PACKAGE_NAME)
  .usage('<command> [options]')
  .description(`${PACKAGE_NAME} - ${PACKAGE_DESC}`);

/**
 * Create a axe-scan.config.json in the working directory with the default values.
 * @example init
 */
program
  .command('init')
  .description(`Create a ${CONFIG_FILE_PATH} in the current directory.`)
  .action(init);

/*
program
  .command('config')
  .description('Modify an item in the configuration file');
*/

/**
 * Run the accessibility test and returns the results as a standard output.
 * @example run --file path/to/urls-list.txt --whitelist ./whitelisted-alerts.csv
 */
program
  .command('run')
  .description('Run the accessibility test.')
  .option(
    '-F, --file <urlsFilePath>',
    'Designate the file path for the list of URLs on which to conduct the accessiblity test.'
  )
  .option(
    '-W, --whitelist <whitelistFilePath>',
    'Designate the file path for the list of whitelisted accessibility alerts.'
  )
  .action(run);

program
  .command('summary')
  .description(
    'Create a summarized accessibility report of the web pages grouped by the WCAG criteria.'
  )
  .option(
    '-F, --file <urlsFilePath>',
    'Designate the file path for the list of URLs on which to conduct the accessiblity test.'
  )
  .option('-P, --page', 'Create the summary report on per page basis.')
  .option(
    '-W, --whitelist <whitelistFilePath>',
    'Designate the file path for the list of whitelisted accessibility alerts.'
  )
  .action(summary);

(async () => {
  try {
    // User input is provided from the process' arguments
    await program.parseAsync(process.argv);
    stopSpinner();
  } catch (error) {
    spinner.stop();
    if (error instanceof AxeScanError) {
      // AxeScanError handles process.exitCode
      console.error(error.message);
    } else if (error instanceof Error) {
      process.exitCode = 1;
      console.error(error.message);
    } else {
      process.exitCode = 1;
      console.error('Unknown error', error);
    }
  }
  spinner.clear();
})();
