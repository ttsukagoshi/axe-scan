import axe from 'axe-core';
import fs from 'fs';
import { createRequire } from 'node:module';
import path from 'path';

import {
  // __dirname,
  CONFIG_FILE_PATH,
  DEFAULT_LOCALE,
  PACKAGE_NAME,
} from './constants.js';

interface I18nMessage {
  [key: string]: LocalizedMessage;
}
interface LocalizedMessage {
  [key: string]: string;
}
const MESSAGES: I18nMessage = {
  en: {
    INFO_INITIATION_COMPLETE_CREATED: `${CONFIG_FILE_PATH} has been created.`,
    INFO_INITIATION_COMPLETE_UPDATED: `${CONFIG_FILE_PATH} has been updated.`,
    INFO_RUNNING: 'Running accessibility scan...',
    INFO_SUMMARY: 'Creating summarized report of the accessibility scan...',
    PROMPT_CONFIG_FILE_ALREADY_EXISTS: `${CONFIG_FILE_PATH} already exists in the current directory. Do you want to overwrite? (y/N)`,
    ERROR_INIT_ABORT: `No overwriting. Aborting ${PACKAGE_NAME} initiation process.`,
  },
  ja: {
    INFO_INITIATION_COMPLETE_CREATED: `完了：設定ファイル ${CONFIG_FILE_PATH} 新規作成`,
    INFO_INITIATION_COMPLETE_UPDATED: `完了：設定ファイル ${CONFIG_FILE_PATH} 更新`,
    INFO_RUNNING: 'アクセシビリティ検査を実行中...',
    INFO_SUMMARY: 'アクセシビリティ検査報告書を作成中...',
    PROMPT_CONFIG_FILE_ALREADY_EXISTS: `${CONFIG_FILE_PATH} は現在のディレクトリ内にすでに存在します。上書きますか？ (y/N)`,
    ERROR_INIT_ABORT: `中断：${PACKAGE_NAME} 初期化を中断しました。${CONFIG_FILE_PATH} は上書きされませんでした。`,
  },
};

export class MessageLocalization {
  locale: string;
  message: LocalizedMessage;
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
