//////////////////
// init command //
//////////////////

import fs from 'fs';

import { AxeScanError } from '../axe-scan-error.js';
import { CONFIG_FILE_PATH, ConfigValue } from '../constants.js';
import { overwritePrompt } from '../inquirer.js';
import { MessageLocalization } from '../messages.js';
import { getConfig, StartDirValue } from '../utils.js';

/**
 * User confirmation to update the config file.
 */
async function confirmConfigUpdate(): Promise<boolean> {
  return (await overwritePrompt()).overwrite;
}

export default async function (): Promise<void> {
  // Gets the contents of the config file in the home directory, if any.
  const config: ConfigValue = getConfig(StartDirValue.HOME);
  const localizedMessage = new MessageLocalization(config.locale);
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    if (await confirmConfigUpdate()) {
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config), {
        flag: 'w',
      });
    } else {
      throw new AxeScanError(localizedMessage.message.ERROR_INIT_ABORT);
    }
    console.info(localizedMessage.message.INFO_INITIATION_COMPLETE_UPDATED);
  } else {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config), {
      flag: 'w',
    });
    console.info(localizedMessage.message.INFO_INITIATION_COMPLETE_CREATED);
  }
}
