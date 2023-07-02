# axe-scan: Testing web accessibility of multiple web pages

[![Accessibility-alt-text-bot](https://github.com/ttsukagoshi/axe-scan/actions/workflows/a11y_alt_text_bot.yml/badge.svg)](https://github.com/ttsukagoshi/axe-scan/actions/workflows/a11y_alt_text_bot.yml) [![CodeQL](https://github.com/ttsukagoshi/axe-scan/actions/workflows/codeql.yml/badge.svg)](https://github.com/ttsukagoshi/axe-scan/actions/workflows/codeql.yml) [![Lint Code Base](https://github.com/ttsukagoshi/axe-scan/actions/workflows/linter.yml/badge.svg)](https://github.com/ttsukagoshi/axe-scan/actions/workflows/linter.yml) [![npm version](https://img.shields.io/npm/v/axe-scan.svg?style=flat-square")](https://www.npmjs.com/package/axe-scan) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A CLI tool to test web accessibility on multiple web pages based on a list of URLs in a text file. Run on Node.js and uses [axe-core](https://github.com/dequelabs/axe-core) and [Puppeteer](https://github.com/puppeteer/puppeteer) as testing and browsing engines.

---

## Table of Contents

- [The basic idea](#the-basic-idea)
- [Testing web accessibility: the basic flow](#testing-web-accessibility-the-basic-flow)
  - [1. Install axe-scan](#1-install-axe-scan)
  - [2. Setup axe-scan and set locale](#2-setup-axe-scan-and-set-locale)
  - [3. Create `urls.txt`](#3-create-urlstxt)
  - [4. Initial accessibility test](#4-initial-accessibility-test)
  - [5. Review the results, resolve issues, and create an allowlist](#5-review-the-results-resolve-issues-and-create-an-allowlist)
  - [6. Accessibility testing: second run](#6-accessibility-testing-second-run)
  - [7. Create a summary report](#7-create-a-summary-report)
  - [8. Share the files with your team](#8-share-the-files-with-your-team)
  - [9. Use with manual checks](#9-use-with-manual-checks)
- [Installation](#installation)
  - [Prerequisite: Node.js](#prerequisite-nodejs)
  - [Install axe-scan](#install-axe-scan)
  - [Update Package](#update-package)
- [Usage](#usage)
  - [Initiate](#initiate)
  - [Configure](#configure)
  - [Run the scan](#run-the-scan)
  - [Create a summarized report](#create-a-summarized-report)
  - [Define allowlist](#define-allowlist)
- [Configuring axe-scan](#configuring-axe-scan)
  - [`axeCoreTags`](#axecoretags)
  - [`resultTypes`](#resulttypes)
  - [`filePath`](#filepath)
  - [`locale`](#locale)
- [Testing on websites with basic authentication](#testing-on-websites-with-basic-authentication)
- [Acknowledgments](#acknowledgments)

---

## The basic idea

Making a website accessible is not just about social equity and legal compliance; accessibility is fundamental to developing and maintaining a user-oriented website. Improved user experience is likely to be favored by search engines like Google, which should be a heads-up for the management-level members of the organization who are less interested in this topic.

Web accessibility is often brought up in the context of the responsibilities of designers and developers, and indeed, the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/) state itself that it is intended for:

> - Web content developers (page authors, site designers, etc.)
> - Web authoring tool developers
> - Web accessibility evaluation tool developers
> - Others who want or need a standard for web accessibility, including for mobile accessibility
>
> (_Who WCAG is for_ from [WCAG 2.0 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/))

Looking a little deeper into the actual contents of the WCAG, however, you will see that EVERY member of those related to developing and maintaining a website, not just the developers and engineers, need to be aware of the requirements to achieve a certain level of accessibility and keep that level. Axe-scan aims to provide a common ground of discussion to improve the website's accessibility between tech professionals and other members who are less familiar with WCAG through the following features:

- **Uses axe-core.** The open-sourced accessibility testing engine [axe-core](https://github.com/dequelabs/axe-core) provided by Deque Systems, Inc. is one of the leading testing engines in the world. Tools using this engine to assist every step of web development are abundant and mostly free of charge. Such testing results will be consistent with axe-scan as long as they use axe-core. This common use of axe-core can be time-saving for both the developer and the client; developers can stop worrying about making last-minute changes in web design.
- **Test multiple web pages at once.** There are plenty of browser extensions and other accessibility testing tools in the world, but (surprisingly) not many can test multiple pages at once. In axe-scan, you only have to prepare a text file with the list of URLs to conduct the test.
- **Output results as CSV.** Testing results can be easily saved as a CSV file and shared with your team using a spreadsheet application to discuss the items requiring action.
- **Allowlist for repetitive testing.** Some results of axe-core are labeled `incomplete`, which refers to HTML elements that axe-core could not mechanically determine as `passes` or `violations` of the rules. These `incomplete` results may include elements that do not need further action. To avoid such elements from repetitively appearing in the results, the axe-scan provides an option to define the list of the elements as an allowlist.
- **Localizations available in axe-core are reflected in the output.** axe-core comes with the community-maintained set of localizations ([Supported Locales | axe-core](https://github.com/dequelabs/axe-core#supported-locales)). You can easily change the language of the axe-scan results to any of the localizations supported in axe-core.
- **Create summarized report based on WCAG Success Criteria.** While axe-core references the WCAG Success Criteria (SC) in its output, the test itself is conducted based on axe-core's original set of rules. To see how the set of web pages have passed each of the WCAG SC supported by axe-core, axe-scan can provide you with a summarized report grouped by the SC.

## Testing web accessibility: the basic flow

This section lays out the basic outlines of testing web accessibility using axe-scan. See the later sections for details.

### 1. Install axe-scan

See the [Installation](#installation) section.

### 2. Setup axe-scan and set locale

Setup axe-scan in your working directory:

```
axe-scan init
```

If you want to change the language of the axe-scan output:

```
axe-scan config --change-value locale=ja
```

The above example sets the locale to `ja` or Japanese. See the [`locale` in Configuring axe-scan](#locale) section for more details on the values that it can take.

### 3. Create `urls.txt`

In your current working directory, create a list of the URLs on which to conduct the accessibility test. The URLs should be separated by line breaks. Name the file `urls.txt`. See [Run the scan](#run-the-scan) section for more detail.

### 4. Initial accessibility test

Conduct the initial test and save the results to `results.csv`:

```
axe-scan run > results.csv
```

A list of around 1,000 pages will take approx. 1 hour to complete.

### 5. Review the results, resolve issues, and create an allowlist

Open the `results.csv` and check the contents. You will likely see that under the `Result Types` column, there are `violations` and `incomplete` items.

`Violations` are elements that clearly violate one or more of the WCAG Success Criteria. Address these issues. Note that there may be multiple rows for a single issue if it has more than one way to resolve it. Once handled properly using one of the methods, the set of items will all disappear.

`Incomplete` are elements that axe-core could not clearly determine whether it is a violation or not. Check the item manually and determine if it is a violation or not. If no problems were found, flag the row to include it in the allowlist for future use.

Create an `allowlist.csv` by filtering the `results.csv` for items that you marked so. Include the first row, i.e., the header row, when you save `allowlist.csv` as a new file.

### 6. Accessibility testing: second run

Execute the second run on the accessibility test, this time taking into account the contents of the `allowlist.csv`:

```
axe-scan run --allowlist allowlist.csv > results-allowlisted.csv
```

Check the created CSV file `results-allowlisted.csv` and see that items in the `allowlist.csv` are not present. In fact, if you have resolved the violations in the previous step, this CSV file should be empty.

### 7. Create a summary report

To create a summary report based on the WCAG Success Criteria, run:

```
axe-scan summary --allowlist allowlist.csv > summary-allowlisted.csv
```

After the previous steps, all items should be PASS or INAPPLICABLE.

### 8. Share the files with your team

- `results-allowlisted.csv`
- `allowlist.csv`
- `summary-allowlisted.csv`

You can use the `allowlist.csv` for periodical web accessibility tests using axe-scan to easily detect new `violations` and `incomplete` items.

### 9. Use with manual checks

Axe-scan is not a one-size-fits-all accessibility test. There are some WCAG Success Criteria (SC) that axe-scan cannot check, so to create a full checklist of all the WCAG SC, you will have to use axe-scan together with other means like manual reviews or tests using other specialized tools.

## Installation

### Prerequisite: Node.js

To install axe-scan, you must have Node.js installed as a prerequisite. To check, enter on your Terminal, Powershell, Command Prompt, or your preferred client:

```
node -v
```

If this returns an error, [install the latest LTS version of Node.js](https://nodejs.org/) before you proceed below. This document will not go into the details, but there are ways to make version management of Node.js easier for macOS and Linux users:

- [Homebrew — The Missing Package Manager for macOS (or Linux)](https://brew.sh/index)
- [hokaccha/nodebrew: Node.js version manager](https://github.com/hokaccha/nodebrew)

### Install axe-scan

On your Terminal, enter:

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

Remove the `-g` option like in the [Install axe-scan](#install-axe-scan) section, depending on your needs.

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

> This section handles the usage of the `config` command. See [Configuring axe-scan](#configuring-axe-scan) section for more details on the respective configuration items.

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

Run the accessibility test. By default, axe-scan searches for `urls.txt` in the user's current directory and conducts accessibility tests against the URLs listed in the file. The contents of the text file should look something like the one below, where the target web page URLs are separated by line breaks. Text encoding should be in UTF-8.

```
https://www.website-to-test.com/
https://www.website-to-test.com/subpage/
https://www.website-to-test.com/another-subpage/
```

You may want to see also the [Testing on websites with basic authentication](#testing-on-websites-with-basic-authentication) section.

Axe-scan outputs the list of page-by-page, element-by-element test results, where the result type is `violation` or `incomplete`. See [the axe-core documentation](https://www.deque.com/axe/core-documentation/api-documentation/#results-object) for their definitions. Which result type to output in the report can be changed by editing the configuration file `axe-scan.config.json`:

```jsonc
{
  "resultTypes": ["incomplete", "violations"] // Omitted from the default settings are "passes" and "inapplicable"
}
```

To create an output CSV file:

```
axe-scan run > axe-results.csv
```

Returns an error if `urls.txt` is not found. Optionally designate a custom path for the list of URLs using the `--file` option. Likewise, optionally designate an allowlist file path using the `--allowlist` flag. The matching alerts will be excluded from the output:

```
axe-scan run --file urls-list.txt --allowlist /path/to/allowlisted-alerts.csv > result-allowlisted.csv
```

For details on using the allowlist, see the [Define allowlist](#define-allowlist) section.

#### Options

- `-F`, `--file <urlsFilePath>`: Designate the file path for the list of URLs on which to conduct the accessibility test.
- `-A`, `--allowlist <allowlistFilePath>`: Designate the file path for the allowlist of accessibility alerts.

### Create a summarized report

```
axe-scan summary [options]
```

Create a summarized accessibility report of the web pages grouped by the WCAG success criteria. If the option `--page` is set, the report will be generated per page.

You may want to see also the [Testing on websites with basic authentication](#testing-on-websites-with-basic-authentication) section.

#### Options

- `-F`, `--file <urlsFilePath>`: Designate the file path for the list of URLs on which to conduct the accessibility test.
- `-P`, `--page`: Create the summary report on per page basis.
- `-A`, `--allowlist <allowlistFilePath>`: Designate the file path for the allowlist of accessibility alerts.

### Define allowlist

The results of `axe-scan run` are likely to come with items whose result type is `incomplete`, which refers to HTML elements that require further testing and manual checks. If, after further testing, you decide to regard the item as `passes` (= no accessibility issue found), you can add it to the allowlist.

The `allowlist.csv` is essentially a subset of `results.csv` created by:

```
axe-scan run > results.csv
```

Filter the rows that you would like to add to the allowlist and save it as another CSV file, e.g., `allowlist.csv`. Be sure to copy the first row, i.e., the header row, to the allowlist as well.

You can then run subsequent accessibility tests using the `--allowlist <allowlistFilePath>` option to filter out the items listed in the allowlist from the axe-scan outputs:

```
axe-scan run --allowlist allowlist.csv > results-allowlisted.csv
axe-scan summary -A allowlist.csv > summary.csv
```

## Configuring axe-scan

### `axeCoreTags`

The axe-core tags define the set of rules the accessibility test should be conducted on. For example, if you want to test the rules pertaining to WCAG 2.1 Level AA, you should include the `wcag21aa` tag. You can also designate a specific WCAG success criterion like `wcag111`, which indicates WCAG 2 success criterion 1.1.1. See the [official documentation on axe-core tags](https://www.deque.com/axe/core-documentation/api-documentation/#user-content-axe-core-tags) for more detail and the possible values it can take.

#### Default value

`["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]`

### `resultTypes`

The results types of axe that should be output on `axe-scan run` command. The original axe results are grouped according to their outcome into the following arrays groups: `passes` (These results indicate what elements passed the rules), `violations` (These results indicate what elements failed the rules), `inapplicable` (These results indicate which rules did not run because no matching content was found on the page. For example, with no video, those rules won't run.), and `incomplete` (These results were aborted and require further testing. This can happen either because of technical restrictions to what the rule can test, or because a javascript error occurred.). See the [official documentation on axe-core options](https://www.deque.com/axe/core-documentation/api-documentation/#options-parameter) for more detail.

#### Default value

`["incomplete", "violations"]`

### `filePath`

File path to the list of URLs to test accessibility on. For example, if you want axe-scan to refer to the `target-urls.txt` in a subdirectory named `data` in your macOS, you would set this value to `./data/target-urls.txt`.

#### Default value

`./urls.txt`

### `locale`

The language of the axe output and messages of axe-scan. See [dequelabs/axe-core](https://github.com/dequelabs/axe-core#supported-locales) for the comprehensive list of supported locales in axe. Except for `en` (English; the default value), the language code should match the JSON file names available in the [locales folder of axe-core](https://github.com/dequelabs/axe-core/tree/develop/locales), e.g., `de` (Germany) from `de.json` and `pt_BR` (Portuguese (Brazilian)) from `pt_BR.json`. Note that messages of axe-scan are separately maintained in [`./src/messages.ts` of this repository](https://github.com/ttsukagoshi/axe-scan/blob/main/src/messages.ts)

#### Default value

`en`

## Testing on websites with basic authentication

When testing on websites with basic authentication, include the auth info in the list of URLs in the following format:

```
https://userid:password@example.com/
```

For example, if you are testing on the following pages:

```
https://mywebsite.com/
https://mywebsite.com/subpage1/
https://mywebsite.com/subpage2/
```

with basic authentication of ID: `myAccountId` and password: `qwerty`, your `urls.txt` should look like this:

```
https://myAccountId:qwerty@mywebsite.com/
https://myAccountId:qwerty@mywebsite.com/subpage1/
https://myAccountId:qwerty@mywebsite.com/subpage2/
```

## Acknowledgments

Although coded from scratch, this tool itself was greatly inspired by works of [louis-reed/axe-reports](https://github.com/louis-reed/axe-reports) and [caztcha/axe-test](https://github.com/caztcha/axe-test). Both have utilized the results of axe-core to create a CSV or spreadsheet of accessibility issues.
