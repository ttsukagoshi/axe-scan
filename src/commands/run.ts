import fs from 'fs';
import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';
// import AXE_LOCALE_JA from 'axe-core/locales/ja.json';
const axeConfig = {
  /*locale: AXE_LOCALE_JA*/
};

// import { AxeScanError } from '../axe-scan-error';
import { ConfigValue, REPORT_HEADER } from '../constants.js';
import { LOG } from '../messages.js';
import { getConfig, spinner } from '../utils.js';

const config: ConfigValue = getConfig();

export default async (): Promise<void> => {
  let outputText = '';

  // Start spinner
  spinner.start(LOG.RUNNING);

  const urls = fs
    .readFileSync(config.filePath /*, { encoding: config.encoding }*/)
    .toString()
    .replace(/\r?\n/g, ',')
    .split(',');
  const browser = await puppeteer.launch();
  for (let i = 0; i < urls.length; i++) {
    if (i === 0) {
      outputText += REPORT_HEADER.join();
    }
    const url = urls[i];
    const page = await browser.newPage();
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
    const results: any = await new AxePuppeteer(page)
      .configure(axeConfig)
      .withTags(config.axeCoreTags)
      .analyze();
    config.resultTypes.forEach((resultType: string) => {
      results[resultType].forEach((resultItem: any) => {
        resultItem.nodes.forEach((node: any) => {
          node.any.forEach((a: any) => {
            let outputRow = [
              results.url,
              resultItem.id,
              resultType,
              resultItem.tags
                .filter((tag: string) => config.axeCoreTags.includes(tag))
                .join(),
              resultItem.impact,
              a.message,
              node.html,
              node.target.join(),
              resultItem.help,
              resultItem.helpUrl,
              resultItem.tags
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
                .join(' '),
            ]
              .map((value) =>
                String(value)
                  .replace(/,/g, '-')
                  .replace(/(\n|\r|\r\n)/gm, ' ')
              )
              .join();
            outputText += `\n${outputRow}`;
          });
        });
      });
    });
    await page.close();
  }
  await browser.close();
  console.info(outputText);
};
