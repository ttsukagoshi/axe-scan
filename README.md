# axe-scan: Testing web accessiblity of multiple web pages

A Node.js package to test web accessibility on multiple web pages based on a list of URLs in a text file. Uses [axe-core](https://github.com/dequelabs/axe-core) and [Puppeteer](https://github.com/puppeteer/puppeteer) as its testing and browsing engines.

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
axe-scan init
```

Create a `axe-scan.config.json` in the working directory with the default values. If there is an existing config file in the directory, it will ask the user whether to update the file or to abort. If the user has placed a config file at their home directory `~/axe-scan.config.json`, `axe-scan init` will copy that setting instead of the default values.

#### Default settings

```jsonc
{
  "axeCoreTags": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"], // For available values, see https://www.deque.com/axe/core-documentation/api-documentation/#user-content-axe-core-tags
  "resultTypes": ["incomplete", "violations"],
  "filePath": "./urls.txt",
  "locale": "en"
}
```

<!--
### Configure

```
axe-scan config [--global | -g] <key>=<value>
```

Save the setting to the local `./axe-scan.config.json` file. Returns an error if local `axe-scan.config.json` does not exist and encourages the user to run `axe-scan init` first. Returns another error if the designated key/value does not match the predefined key/value sets.

User options will be determined in the following order: (1) `./axe-scan.config.json` file in the working directory, (2) `~/axe-scan.config.json` file in the user's home directory, and (3) default settings.


-->

### Run the scan

```
axe-scan run
```

By default, axe-scan searches for `urls.txt` in the user's current directory and conducts accessibility tests against the URLs listed in the file. The contents of the text file should look something like below, where the target web page URLs are separated by line breaks. Text encoding should be in UTF-8.

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
axe-scan run --file urls-list.txt --whitelist /path/to/whitelisted-alerts.csv
```

For details of whitelisting, see the [Define whitelist section](#define-whitelist).

### Create a summarized report

```
axe-scan summary [--pages | -P] [--whitelist | -W] ./whitelisted-alerts.csv
```

Create a summarized accessibility report of the web pages grouped by the WCAG indices. If the option `--pages` is set, the report will be generated per page.

### Define whitelist
