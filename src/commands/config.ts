import fs from 'fs';

import { AxeScanError } from '../axe-scan-error.js';
import {
  ConfigValue,
  CONFIG_FILE_PATH,
  RESULT_TYPES_FULL_SET,
} from '../constants.js';
import { MessageLocalization } from '../messages.js';
import { getConfig, CONFIG_FILE_PATH_HOME } from '../utils.js';

interface CommandOption {
  readonly changeValue?: string;
  readonly global?: boolean;
}

const config = getConfig();
const localizedMessage = new MessageLocalization(config.locale);

export default function (option: CommandOption): void {
  if (!Object.keys(option).length || (!option.changeValue && option.global)) {
    // If no option is given, or if only the --global option is set,
    // return the set of currently active axe-scan settings.
    const currentSettings =
      Object.keys(config)
        .sort()
        .reduce((outputText: string, key: string): string => {
          outputText += `${key}: ${JSON.stringify(
            config[key as keyof ConfigValue]
          )}\n`;
          return outputText;
        }, localizedMessage.message.text.INFO_CURRENT_CONFIG) +
      localizedMessage.message.text.INFO_CURRENT_CONFIG_SUFFIX;
    console.info(currentSettings);
  } else {
    const targetConfigFilePath = option.global
      ? CONFIG_FILE_PATH_HOME
      : CONFIG_FILE_PATH;
    if (!fs.existsSync(targetConfigFilePath)) {
      throw new AxeScanError(
        localizedMessage.message.func.ERROR_CONFIG_FILE_NOT_FOUND(
          targetConfigFilePath,
          option.global ? ' --global' : ''
        )
      );
    } else {
      // Parse the key=value string and update the config file.
      fs.writeFileSync(
        targetConfigFilePath,
        JSON.stringify(
          Object.assign(config, parseKeyValue(option.changeValue))
        ),
        {
          flag: 'w',
        }
      );
    }
    console.info(localizedMessage.message.text.INFO_CONFIG_UPDATED);
  }
}

/**
 * Parse the key=value string entered by the user into a partial ConfigValue object.
 * Inappropriate key-value sets will throw an error.
 * @param keyValue The key=value string
 * @returns The entered key-value set parsed into a partial ConfigValue object of {key: value}
 */
function parseKeyValue(keyValue: string | undefined): Partial<ConfigValue> {
  if (!keyValue) {
    throw new AxeScanError(
      localizedMessage.message.text.ERROR_KEY_VALUE_NOT_SET
    );
  }
  const [key, value]: string[] = keyValue.split('=');
  const keyValueObj: Partial<ConfigValue> = {};
  if (['axeCoreTags', 'resultTypes'].includes(key)) {
    const valueArr: string[] = value.split(',');
    if (key === 'axeCoreTags') {
      keyValueObj.axeCoreTags = valueArr;
    } else if (key === 'resultTypes') {
      valueArr.forEach((value) => {
        if (!RESULT_TYPES_FULL_SET.includes(value)) {
          throw new AxeScanError(
            localizedMessage.message.text.ERROR_INVALID_VALUE_FOR_RESULTTYPES
          );
        }
      });
      keyValueObj.resultTypes = valueArr;
    }
  } else if (['filePath', 'locale'].includes(key)) {
    if (key === 'filePath') {
      keyValueObj.filePath = value;
    } else if (key === 'locale') {
      keyValueObj.locale = value;
    }
  } else {
    throw new AxeScanError(
      localizedMessage.message.func.ERROR_INVALID_CONFIG_KEY(key)
    );
  }
  return keyValueObj;
}
