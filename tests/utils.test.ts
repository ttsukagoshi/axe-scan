/* eslint-disable @typescript-eslint/no-var-requires */

jest.mock('fs');
jest.mock('ora');
jest.mock('os');

import {
  spinner,
  stopSpinner,
  convertStringForCsv,
  getConfig,
  StartDirValue,
} from '../src/utils';

const getConfigPatterns = [
  {
    startDir: undefined,
    mockFiles: {},
    expected: {
      axeCoreTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      resultTypes: ['incomplete', 'violations'],
      filePath: './urls.txt',
      locale: 'en',
    },
  },
  {
    startDir: undefined,
    mockFiles: {
      'axe-scan.config.json': JSON.stringify({
        axeCoreTags: ['wcag21aa'],
        filePath: './mock-urls-local.txt',
        locale: 'ja',
      }),
    },
    expected: {
      axeCoreTags: ['wcag21aa'],
      resultTypes: ['incomplete', 'violations'],
      filePath: './mock-urls-local.txt',
      locale: 'ja',
    },
  },
  {
    startDir: StartDirValue.CURRENT,
    mockFiles: {
      'axe-scan.config.json': JSON.stringify({
        axeCoreTags: ['wcag21aaa'],
        filePath: './mock-urls-local.txt',
        locale: 'ja',
      }),
    },
    expected: {
      axeCoreTags: ['wcag21aaa'],
      resultTypes: ['incomplete', 'violations'],
      filePath: './mock-urls-local.txt',
      locale: 'ja',
    },
  },
  {
    startDir: StartDirValue.HOME,
    mockFiles: {},
    expected: {
      axeCoreTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      resultTypes: ['incomplete', 'violations'],
      filePath: './urls.txt',
      locale: 'en',
    },
  },
  {
    startDir: StartDirValue.HOME,
    mockFiles: {
      '~/homedir/axe-scan.config.json': JSON.stringify({
        resultTypes: ['incomplete', 'violations', 'passes'],
        filePath: './mock-urls-global.txt',
      }),
    },
    expected: {
      axeCoreTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      resultTypes: ['incomplete', 'violations', 'passes'],
      filePath: './mock-urls-global.txt',
      locale: 'en',
    },
  },
];
const convertStringForCsvPatterns = [
  {
    text: 'test,pattern,with,commas,only',
    expected: 'test-pattern-with-commas-only',
  },
  {
    text: `test\npattern\r\nwith\n\rline\rbreaks
    in multiple\nrows
    `,
    expected: 'test pattern  with  line breaks     in multiple rows     ',
  },
];

describe('Test for utils.ts', () => {
  // spinner
  describe('Test spinner/stopSpinner', () => {
    test('Test stopSpinner when spinner.isSpinning == true', () => {
      spinner.start();
      stopSpinner();
      expect(spinner.isSpinning).toBeFalsy();
    });
    test('Test stopSpinner when spinner.isSpinning == false', () => {
      expect(spinner.isSpinning).toBeFalsy();
    });
  });
  // getConfig
  describe.each(getConfigPatterns)(
    'Test getConfig',
    ({ startDir, mockFiles, expected }) => {
      beforeEach(() => require('fs').__setMockFiles(mockFiles));
      test(`Check getConfig with\n\t- startDir: ${startDir}\n\t- mockFiles: ${JSON.stringify(
        mockFiles
      )}`, () => {
        expect(getConfig(startDir)).toEqual(expected);
      });
    }
  );
  // convertStringForCsv
  describe.each(convertStringForCsvPatterns)(
    'Test convertStringForCsv',
    ({ text, expected }) => {
      test(`Check convertStringForCsv with ${text}`, () => {
        expect(convertStringForCsv(text)).toBe(expected);
      });
    }
  );
});
