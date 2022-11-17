// init: Create a config file in the current directory

import fs from 'fs';

import { AxeScanError } from '../axe-scan-error.js';
import { CONFIG_FILE_PATH, ConfigValue } from '../constants.js';
import { overwritePrompt } from '../inquirer.js';
import { MessageLocalization } from '../messages.js';
import { CONFIG_FILE_PATH_HOME, getConfig, StartDirValue } from '../utils.js';

interface CommandOption {
  readonly global?: boolean;
}

/**
 * User confirmation to update the config file.
 */
async function confirmConfigUpdate(): Promise<boolean> {
  return (await overwritePrompt()).overwrite;
}

/**
 * Create a config file in the current directory.
 * @param {boolean} option.global Create the config file in the home directory instead.
 */
export default async function (option: CommandOption): Promise<void> {
  // Gets the contents of the config file in the home directory, if any.
  const config: ConfigValue = getConfig(StartDirValue.HOME);
  const localizedMessage = new MessageLocalization(config.locale);
  const targetFilePath = option.global
    ? CONFIG_FILE_PATH_HOME
    : CONFIG_FILE_PATH;
  if (fs.existsSync(targetFilePath)) {
    if (await confirmConfigUpdate()) {
      fs.writeFileSync(targetFilePath, JSON.stringify(config), {
        flag: 'w',
      });
    } else {
      throw new AxeScanError(localizedMessage.message.text.ERROR_INIT_ABORT);
    }
    console.info(
      localizedMessage.message.func.INFO_INITIATION_COMPLETE_UPDATED(
        targetFilePath
      )
    );
  } else {
    fs.writeFileSync(targetFilePath, JSON.stringify(config), {
      flag: 'w',
    });
    console.info(
      localizedMessage.message.func.INFO_INITIATION_COMPLETE_CREATED(
        targetFilePath
      )
    );
  }
}
