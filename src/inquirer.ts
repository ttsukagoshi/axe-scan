import inquirer from 'inquirer';

import { MessageLocalization } from './messages.js';
import { getConfig } from './utils.js';

const { prompt } = inquirer;
const localizedMessage = new MessageLocalization(getConfig().locale);

/**
 * Inquirer prompt for overwriting a config file.
 * @returns A promise for an object with the `overwrite` property.
 */
export function overwritePrompt(): Promise<{ overwrite: boolean }> {
  return prompt<{ overwrite: boolean }>([
    {
      default: false,
      message: localizedMessage.message.PROMPT_CONFIG_FILE_ALREADY_EXISTS,
      name: 'overwrite',
      type: 'confirm',
    },
  ]);
}
