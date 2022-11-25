// summary: Create a summarized accessibility report of the web pages grouped by the WCAG criteria.

import { AxePuppeteer } from '@axe-core/puppeteer';
import axe from 'axe-core';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import puppeteer from 'puppeteer';

// import { AxeScanError } from '../axe-scan-error';
import {
  VERSION,
  ConfigValue,
  ReportRowValue,
  SUMMARY_HEADER,
} from '../constants.js';
import { MessageLocalization, setAxeLocalization } from '../messages.js';
import {
  getConfig,
  spinner,
  PartialAxeResults,
  convertStringForCsv,
} from '../utils.js';

interface CommandOption {
  readonly file?: string;
  readonly page?: boolean;
  readonly allowlist?: string;
  readonly whitelist?: string; // Scheduled to be deprecated on v2.0
}
interface AllPagesReportSummary {
  [key: string]: ReportSummary;
}
interface ReportSummary {
  [key: string]: CriterionSummary;
}
interface CriterionSummary {
  level: WcagLevel;
  result: SummaryResult;
}
enum WcagLevel {
  AAA = 'AAA',
  AA = 'AA',
  A = 'A',
  NA = 'NA',
}
enum SummaryResult {
  PASS = 'PASS',
  VIOLATION = 'VIOLATION',
  INAPPLICABLE = 'INAPPLICABLE',
}
const config: ConfigValue = getConfig();
const localizedMessage = new MessageLocalization(config.locale);
const axeConfig: axe.Spec = {
  locale: setAxeLocalization(config.locale),
};

// RegExp to catch WCAG-related axe-core tags in https://www.deque.com/axe/core-documentation/api-documentation/#user-content-axe-core-tags
const wcagRegExp = /^wcag(\d{3}|\d{1,2}[a]{1,3})$/;

/**
 * Summarize and updates the axe result by their respective result types.
 * @param axeResult Axe result object
 * @param resultType Axe result types: violation, incomplete, passes, or inapplicable
 * @param resultSummary PASS, VIOLATION, or INAPPLICABLE
 * @param summaryObj Object in which to save summary results.
 * @param outputByPage When true, the top-level key of summaryObj will be the respective page URLs.
 * @param allowlist Allowlisted alerts to be ommited from the output; a subset of the `axe-scan run` output.
 * @returns The updated summaryObj
 */
function summarizeAxeResult(
  axeResult: axe.AxeResults,
  resultType: string,
  resultSummary: SummaryResult,
  summaryObj: AllPagesReportSummary,
  outputByPage: boolean,
  allowlist: ReportRowValue[] | undefined = undefined
) {
  axeResult[resultType as keyof PartialAxeResults].forEach(
    (element: axe.Result) => {
      let summary: SummaryResult = resultSummary;
      if (allowlist) {
        if (
          // If all of the nodes in this element is listed on the allowlist,
          // this element will be regarded as "PASS"
          element.nodes.every((node: axe.NodeResult) =>
            allowlist.some(
              (row: ReportRowValue) =>
                row.URL == axeResult.url &&
                row['Rule Type'] == element.id &&
                row['Result Type'] == resultType &&
                row['Rule Set'] ==
                  element.tags
                    .filter((tag: string) => config.axeCoreTags.includes(tag))
                    .join() &&
                row['Impact'] == element.impact &&
                convertStringForCsv(row['HTML Element']) ==
                  convertStringForCsv(node.html) &&
                convertStringForCsv(row['DOM Element']) ==
                  convertStringForCsv(node.target.join()) &&
                row['WCAG Criteria'] ==
                  element.tags
                    .reduce((arr: string[], tag: string) => {
                      if (tag.match(/^wcag\d{3}$/)) {
                        arr.push(
                          [
                            tag.slice(-3, -2),
                            tag.slice(-2, -1),
                            tag.slice(-1),
                          ].join('.')
                        );
                      }
                      return arr;
                    }, [])
                    .join(' ')
            )
          )
        ) {
          summary = SummaryResult.PASS;
        }
      }
      const wcagTags: string[] = element.tags.filter((tag: string) =>
        tag.match(wcagRegExp)
      );
      if (wcagTags.length > 0) {
        const urlKey: string = outputByPage ? axeResult.url : 'ALL';
        if (!summaryObj[urlKey]) {
          summaryObj[urlKey] = {};
        }

        // WCAG level (A, AA, AAA)
        const wcagLevelTag: string | undefined = wcagTags.find((tag: string) =>
          tag.match(/^wcag\d{1,2}[a]{1,3}$/)
        );
        let wcagLevel: WcagLevel = WcagLevel.NA;
        if (wcagLevelTag) {
          if (wcagLevelTag.endsWith('aaa')) {
            wcagLevel = WcagLevel.AAA;
          } else if (wcagLevelTag.endsWith('aa')) {
            wcagLevel = WcagLevel.AA;
          } else if (wcagLevelTag.endsWith('a')) {
            wcagLevel = WcagLevel.A;
          }
        }

        // WCAG Criteria
        wcagTags
          .reduce((arr: string[], tag: string): string[] => {
            if (tag.match(/^wcag\d{3}$/)) {
              arr.push(
                [tag.slice(-3, -2), tag.slice(-2, -1), tag.slice(-1)].join('.')
              );
            }
            return arr;
          }, [])
          .forEach((criterion: string) => {
            if (
              summaryObj[urlKey][criterion] &&
              summaryObj[urlKey][criterion].result === SummaryResult.VIOLATION
            ) {
              return;
            } else {
              summaryObj[urlKey][criterion] = {
                result: summary,
                level: wcagLevel,
              };
            }
          });
      } else {
        return;
      }
    }
  );
  return summaryObj;
}

/**
 * Create a summarized accessibility report of the web pages grouped by the WCAG criteria.
 * @param {string} options.file File path to the text file containing the list of URLs.
 * @param {boolean} options.page When set, the report will be generated per page.
 * @param {string} options.allowlist File path to the CSV file containing the allowlisted alerts to be ommited from the output.
 * @param {string} options.whitelist Alias of options.allowlist. Scheduled to be deprecated on v2.0
 */
export default async function (options: CommandOption): Promise<void> {
  // Start spinner
  spinner.start(localizedMessage.message.text.INFO_SUMMARY);

  const filePath: string = options?.file
    ? options.file
    : Array.isArray(config.filePath)
    ? config.filePath.join()
    : config.filePath;
  const urls: string[] = fs
    .readFileSync(filePath /*, { encoding: config.encoding }*/)
    .toString()
    .replace(/\r?\n/g, ',')
    .split(',');

  // Optional allowlisted items
  /* Use this script after --whitelist option is deprecated in >= v2.0
  const allowlist: ReportRowValue[] | undefined = options?.allowlist
    ? parse(fs.readFileSync(options.allowlist), { columns: true })
    : undefined;
  */
  let allowlist: ReportRowValue[] | undefined = undefined;
  if (options?.allowlist || options?.whitelist) {
    // options.whitelist is scheduled to be deprecated on v2.0
    if (options.allowlist) {
      allowlist = parse(fs.readFileSync(options.allowlist), { columns: true });
    } else if (options.whitelist) {
      allowlist = parse(fs.readFileSync(options.whitelist), { columns: true });
    }
  }

  // Optional page flag
  const outputByPage: boolean = options?.page ? true : false;

  const browser: puppeteer.Browser = await puppeteer.launch();

  let outputObj: AllPagesReportSummary = {};
  for (let i = 0; i < urls.length; i++) {
    const url: string = urls[i];
    const page: puppeteer.Page = await browser.newPage();
    await page.setBypassCSP(true);
    /* Emulate device: left here as a potential option for the future
      await page.emulate(puppeteer.devices['iPhone 8']);
      */

    // Read the web page
    await Promise.all([
      page.setDefaultNavigationTimeout(0),
      page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] }),
      page.goto(`${url}`),
    ]);
    // Execute accessibility test
    const results: axe.AxeResults = await new AxePuppeteer(page)
      .configure(axeConfig)
      .withTags(config.axeCoreTags)
      .analyze();

    // Summarize results
    // 'inapplicable' summarized as INAPPLICABLE
    outputObj = summarizeAxeResult(
      results,
      'inapplicable',
      SummaryResult.INAPPLICABLE,
      outputObj,
      outputByPage
    );
    // 'passes' summarized as PASS
    outputObj = summarizeAxeResult(
      results,
      'passes',
      SummaryResult.PASS,
      outputObj,
      outputByPage
    );
    // 'incomplete' summarized as VIOLATION
    outputObj = summarizeAxeResult(
      results,
      'incomplete',
      SummaryResult.VIOLATION,
      outputObj,
      outputByPage,
      allowlist
    );
    // 'violations' summarized as VIOLATION
    outputObj = summarizeAxeResult(
      results,
      'violations',
      SummaryResult.VIOLATION,
      outputObj,
      outputByPage,
      allowlist
    );
    await page.close();
  }
  await browser.close();
  // Create output text
  let outputText: string = SUMMARY_HEADER.join();
  Object.keys(outputObj)
    .sort()
    .forEach((urlKey: string) =>
      Object.keys(outputObj[urlKey])
        .sort()
        .forEach((criterion: string) => {
          outputText += `\n${[
            urlKey,
            criterion,
            outputObj[urlKey][criterion].level,
            outputObj[urlKey][criterion].result,
            VERSION,
          ].join()}`;
        })
    );
  console.info(outputText);
}
