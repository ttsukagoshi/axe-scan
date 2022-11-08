#!/usr/bin/env node

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import loudRejection from 'loud-rejection';
import { program } from 'commander';
import { readPackageUpSync } from 'read-pkg-up';

// Local imports
import { spinner, stopSpinner } from './utils.js';
import { AxeScanError } from './axe-scan-error.js';
// Subcommands
// import init from './commands/init.js';
import run from './commands/run.js';
// import summary from './commands/summary.js';

// Get environmental variables and user settings
const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = readPackageUpSync({ cwd: __dirname });
const [PACKAGE_NAME, PACKAGE_DESC, VERSION] = manifest
  ? [
      manifest.packageJson.name,
      manifest.packageJson.description,
      manifest.packageJson.version,
    ]
  : ['unknown', 'unknown', 'unknown'];
// const config = Config.get();

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
  .description('Create a axe-scan.config.json in the current directory.');
//  .action(init);
//  .option('--global, -g', 'Creates the axe-scan.config.json file in the user\'s root directory')

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
    '--file, -F <urlsFilePath>',
    'Designate the file path for the list of URLs on which to conduct the accessiblity test.'
  )
  .option(
    '--whitelist, -W <whitelistFilePath>',
    'Designate the file path for the list of whitelisted accessibility alerts.'
  )
  .action(run);

program
  .command('summary')
  .description(
    'Create a summarized accessibility report of the web pages grouped by the WCAG criteria.'
  )
  .option('--page, -P', 'Create the summary report on per page basis.')
  .option(
    '--whitelist, -W <whitelistFilePath>',
    'Designate the file path for the list of whitelisted accessibility alerts.'
  );
//  .action(summary);

// const [_bin, _sourcePath, ...args] = process.argv;
const [, , ...args] = process.argv;
// Defaults to help if commands are not provided
if (args.length === 0) {
  program.outputHelp();
}

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
