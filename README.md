# axe-scan: Testing web accessiblity of multiple web pages

A CLI tool to test web accessibility on multiple web pages based on a list of URLs in a text file. Run on Node.js and uses [axe-core](https://github.com/dequelabs/axe-core) and [Puppeteer](https://github.com/puppeteer/puppeteer) as its testing and browsing engines.

## Installation

### Prerequisite: Node.js

To install axe-scan, you will need to have Node.js install as a prerequisite. To check, enter on your Terminal, Powershell, Command Prompt, or your preferred client:

```
node -v
```

If this returns an error, [install the latest LTS version of Node.js](https://nodejs.org/) before you proceed below. This document will not go into the details, but there are ways to make version management of Node.js easier for macOS and Linux users:

- [Homebrew — The Missing Package Manager for macOS (or Linux)](https://brew.sh/index)
- [hokaccha/nodebrew: Node.js version manager](https://github.com/hokaccha/nodebrew)

### Install axe-scan

On your Terminal (or whatever), enter:

```
npm install -g axe-scan
```

This installs axe-scan globally, i.e., all executions run on your account will use the same version of axe-scan.

If you want to separate the versions depending on your working directory, install axe-scan locally without the `-g` option:

```
npm install axe-scan
```

If you want to install a specific version of axe-scan, add the version number to the package name:

```
npm install axe-scan@1.0.0
```

### Update Package

To update your installed axe-scan:

```
npm update -g axe-scan
```

Remove the `-g` option like in the [Install axe-scan section](#install-axe-scan) depending on your needs.

## Usage

### Initiate

```
axe-scan init [options]
```

Create a `axe-scan.config.json` in the working directory with the default values. If there is an existing config file in the directory, it will ask you whether to update the file or to abort. If you have placed a config file at your home directory `~/axe-scan.config.json`, `axe-scan init` will copy that setting instead of the default values.

Use the `--global` option to create the config file in your home directory rather than your current working directory:

```
axe-scan init --global
```

#### Options

- `-g`, `--global`: Create the config file in the home directory.

#### Default settings

```json
{
  "axeCoreTags": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  "resultTypes": ["incomplete", "violations"],
  "filePath": "./urls.txt",
  "locale": "en"
}
```

See [Configuring axe-scan](#configuring-axe-scan) section for more detail. User settings will be determined in the following order: (1) `./axe-scan.config.json` file in the working directory, (2) `~/axe-scan.config.json` file in the user's home directory, and (3) default settings.

### Configure

```
axe-scan config [options]
```

Check the valid axe-scan settings. When used with the `--change-value` option, it will modify the axe-scan setting to the local `./axe-scan.config.json` file. Returns an error if local `axe-scan.config.json` does not exist and encourages the user to run `axe-scan init` first. <!--Returns another error if the designated key/value does not match the predefined key/value sets.-->

To assign multiple values to a key, connect the values with a comma:

```
axe-scan config -V resultTypes=incomplete,violations,passes
```

#### Options

- `-V`, `--change-value <key>=<value>`: Modify the value of the designated key item in the configuration file.
- `-g`, `--global`: Edit the config file in the home directory instead of the current directory. Use with the `--change-value` option.

### Run the scan

```
axe-scan run [options]
```

Run the accessibility test. By default, axe-scan searches for `urls.txt` in the user's current directory and conducts accessibility tests against the URLs listed in the file. The contents of the text file should look something like below, where the target web page URLs are separated by line breaks. Text encoding should be in UTF-8.

```
https://www.website-to-test.com/
https://www.website-to-test.com/subpage/
https://www.website-to-test.com/another-subpage/
```

axe-scan outputs the list of page-by-page, element-by-element test results, where the result type is `violation` or `incomplete`. See [the axe-core documentation](https://www.deque.com/axe/core-documentation/api-documentation/#results-object) for their definitions. Which result type to output in the report can be changed by the editing the configuration file `axe-scan.config.json`:

```jsonc
{
  "resultTypes": ["incomplete", "violations"] // Omitted from the default settings are "passes" and "inapplicable"
}
```

To create an output CSV file:

```
axe-scan run > axe-results.csv
```

Returns an error if `urls.txt` is not found. Optionally designate a custom path for the list of URLs using the `--file` option. Likewise, optionally designate a list of whitelisted alerts using the `--whitelist` flag. The matching alerts will be excluded from the output:

```
axe-scan run --file urls-list.txt --whitelist /path/to/whitelisted-alerts.csv > result-whitelisted.csv
```

For details of whitelisting, see the [Define whitelist section](#define-whitelist).

#### Options

- `-F`, `--file <urlsFilePath>`: Designate the file path for the list of URLs on which to conduct the accessibility test.
- `-W`, `--whitelist <whitelistFilePath>`: Designate the file path for the list of whitelisted accessibility alerts.

### Create a summarized report

```
axe-scan summary [options]
```

Create a summarized accessibility report of the web pages grouped by the WCAG success criteria. If the option `--pages` is set, the report will be generated per page.

### Define whitelist

The results of `axe-scan run` is likely to come with items whose result type is `incomplete`, which refer to results that require further testing and manual checks. If after further testing you decided to regard the item as `passes` (= no accessibility issue found), you can add it to the whitelist.

The `whitelist.csv` is essentially a subset of `results.csv` created by:

```
axe-scan run > results.csv
```

Filter the rows that you would like to add to the whitelist and save is as another CSV file, e.g., `whitelist.csv`

You can then run subsequent accessibility tests using the `--whitelist <whitelistFilePath>` option to filter out the whitelisted items from the axe-scan outputs:

```
axe-scan run --whitelist whitelist.csv > results-whitelisted.csv
axe-scan summary -W whitelist.csv > summary.csv
```

## Configuring axe-scan

| Key           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Default value                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `axeCoreTags` | The axe-core tags define the set of rules the accessibility test should be conducted on. For example, if you want to test the rules pertaining to WCAG 2.1 Level AA, you should include the `wcag21aa` tag. You can also designate a specific WCAG success criterion like `wcag111` which indicates WCAG 2 success criterion 1.1.1. See the [official documentation on axe-core tags](https://www.deque.com/axe/core-documentation/api-documentation/#user-content-axe-core-tags) for more detail and the possible values it can take.                                                                                                                                                                                                                                                                                                                      | `["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]` |
| `resultTypes` | The results types of axe that should be output on `axe-scan run` command. The original axe results are grouped according to their outcome into the following arrays groups: `passes` (These results indicate what elements passed the rules), `violations` (These results indicate what elements failed the rules), `inapplicable` (These results indicate which rules did not run because no matching content was found on the page. For example, with no video, those rules won't run.), and `incomplete` (These results were aborted and require further testing. This can happen either because of technical restrictions to what the rule can test, or because a javascript error occurred.). See the [official documentation on axe-core options](https://www.deque.com/axe/core-documentation/api-documentation/#options-parameter) for more detail. | `["incomplete", "violations"]`                 |
| `filePath`    | File path to the list of URLs to test accessibility on. For example, if you want axe-scan to refer to the `target-urls.txt` in a subdirectory named `data` in your macOS, you would set this value to `./data/target-urls.txt`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `./urls.txt`                                   |
| `locale`      | The language of the axe output and messages of axe-scan. See [dequelabs/axe-core](https://github.com/dequelabs/axe-core#supported-locales) for the comprehensive list of supported locales in axe. Except for `en` (English; the default value), the language code should match the JSON file names available in the [locales folder of axe-core](https://github.com/dequelabs/axe-core/tree/develop/locales), e.g. `de` (Germany) from `de.json`. Note that messages of axe-scan are separately maintained in [`./src/messages.ts` of this repository](https://github.com/ttsukagoshi/axe-scan/blob/main/src/messages.ts)                                                                                                                                                                                                                                  | `en`                                           |

## Acknowledgements

Although coded from scratch, this tool itself was greatly inspired by works of [louis-reed/axe-reports](https://github.com/louis-reed/axe-reports) and [caztcha/axe-test](https://github.com/caztcha/axe-test). Both have utilized the results of axe-core to create a CSV or spreadsheet of accessibility issues.
