import axe from 'axe-core';
import fs from 'fs';
import { createRequire } from 'node:module';
import path from 'path';

import { DEFAULT_LOCALE, PACKAGE_NAME } from './constants.js';

interface I18nMessage {
  [key: string]: LocalizedMessageTypes;
}
interface LocalizedMessageTypes {
  text: LocalizedMessageString;
  func: LocalizedMessageFunc;
}
interface LocalizedMessageString {
  [key: string]: string;
}
interface LocalizedMessageFunc {
  [key: string]: MessageFunction;
}
type MessageFunction = (placeholderText: string) => string;

const MESSAGES: I18nMessage = {
  // Messages that take required params are stored
  // in the func object of the respective locales.
  en: {
    text: {
      INFO_RUNNING: 'Running accessibility scan...',
      INFO_SUMMARY: 'Creating summarized report of the accessibility scan...',
      ERROR_INIT_ABORT: `No overwriting. Aborting ${PACKAGE_NAME} initiation process.`,
      PROMPT_CONFIG_FILE_ALREADY_EXISTS:
        'Configuration file already exists in the directory. Do you want to overwrite? (y/N)',
    },
    func: {
      INFO_INITIATION_COMPLETE_CREATED: (
        targetConfigFilePath: string
      ): string => `${targetConfigFilePath} has been created.`,
      INFO_INITIATION_COMPLETE_UPDATED: (
        targetConfigFilePath: string
      ): string => `${targetConfigFilePath} has been updated.`,
    },
  },
  ja: {
    text: {
      INFO_RUNNING: 'アクセシビリティ検査を実行中...',
      INFO_SUMMARY: 'アクセシビリティ検査報告書を作成中...',
      ERROR_INIT_ABORT: `中断：${PACKAGE_NAME} 初期化を中断しました。設定ファイルは上書きされませんでした。`,
      PROMPT_CONFIG_FILE_ALREADY_EXISTS:
        '設定ファイルはディレクトリ内にすでに存在します。上書きますか？ (y/N)',
    },
    func: {
      INFO_INITIATION_COMPLETE_CREATED: (
        targetConfigFilePath: string
      ): string => `完了：設定ファイル ${targetConfigFilePath} 新規作成`,
      INFO_INITIATION_COMPLETE_UPDATED: (
        targetConfigFilePath: string
      ): string => `完了：設定ファイル ${targetConfigFilePath} 更新`,
    },
  },
};

export class MessageLocalization {
  locale: string;
  message: LocalizedMessageTypes;
  constructor(locale: string) {
    if (locale.match(/^[A-Za-z]{2}(_[A-Za_z]{2})?$/)) {
      const availableLocales = Object.keys(MESSAGES);
      const twoLetterUserLocale = locale.slice(0, 2);
      if (availableLocales.includes(locale)) {
        this.locale = locale;
      } else if (availableLocales.includes(twoLetterUserLocale)) {
        this.locale = twoLetterUserLocale;
      } else {
        this.locale = DEFAULT_LOCALE;
      }
    } else {
      this.locale = DEFAULT_LOCALE;
    }
    this.message = Object.assign(
      MESSAGES[DEFAULT_LOCALE],
      MESSAGES[this.locale]
    );
  }
}

export function setAxeLocalization(locale: string): axe.Locale {
  // Get path to the locales directory of the dependent axe-core module
  const require: NodeRequire = createRequire(import.meta.url);
  const axeCoreLocalesPath: string = require
    .resolve('axe-core')
    .replace('axe.js', 'locales');
  // Get the list of available axe-core locales
  const localesList: string[] = fs
    .readdirSync(axeCoreLocalesPath)
    .reduce((availableLocales: string[], filename: string) => {
      if (filename !== '_template.json' && filename.endsWith('.json')) {
        availableLocales.push(filename.replace('.json', ''));
      }
      return availableLocales;
    }, []);

  // Set the axeLocale to the locale designated in the config file
  let axeLocale: axe.Locale;
  if (localesList.includes(locale)) {
    axeLocale = JSON.parse(
      fs
        .readFileSync(path.join(axeCoreLocalesPath, `${locale}.json`))
        .toString()
    );
    return axeLocale;
  } else {
    return {};
  }
}
