# axe-scan: Testing web accessiblity of multiple web pages
A Node.js package to test web accessibility on multiple web pages based on a list of URLs in a text file. Uses @axe-core/puppeteer as its testing engine.

## Install axe-scan
1. Install the latest LTS version of Node.js
2. `npm install -g axe-scan`

The above Step 2 installs axe-scan globally, i.e., all executions run on your PC account will use the same version of `axe-scan`. If you want to separate the versions depending on your working directory, install axe-scan locally: `npm install axe-scan` without the `-g`

## Usage
### Initiate
```
axe-scan init
```
Create a `axe-scan.config.json` in the working directory with the default values. If there is an existing config file in the directory, it will ask the user whether to update the file or to abort. If the user has placed a config file at their home directory `~/axe-scan.config.json`, `axe-scan init` will copy that setting instead of the default values.

### Configure
```
axe-scan config [--global | -g] <key>=<value>
```
Save the setting to the local `./axe-scan.config.json` file. Returns an error if local `axe-scan.config.json` does not exist and encourages the user to run `axe-scan init` first. Returns another error if the designated key/value does not match the predefined key/value sets.

User options will be determined in the following order: (1) `./axe-scan.config.json` file in the working directory, (2) `~/axe-scan.config.json` file in the user's home directory, and (3) default settings.

#### Default settings
```jsonc
{
  "axeCoreTags": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"], // For available values, see https://www.deque.com/axe/core-documentation/api-documentation/#user-content-axe-core-tags
  "resultTypes": ["incomplete", "violations"],
  "filePath": "./urls.txt",
  "encoding": "utf8",
  "locale": "en"
}
```

### Run the scan
```
axe-scan run [--file | -F] path/to/urls-list.txt [--whitelist | -W] ./whitelisted-alerts.csv
```

By default, search for `urls.txt` in the user's current directory and conducts accessibility tests against the listed URLs. STDOUT the list of page-by-page, element-by-element test results, where the result type is `violation` or `incomplete`. Which result type to return can be changed by the editing the configuration file:

```jsonc
{
  "resultTypes": ["incomplete", "violations"] // "pass"
}
```

To create an output CSV file:

```
axe-scan run > axe-results.csv
```

Returns an error if `urls.txt` is not found. Optionally designate a path for the list of URLs using the `--file` option. Designate a list of whitelisted alerts using the `--whitelist` option. The matching alerts will be excluded from the output.

### Create a summarized report
```
axe-scan summary [--pages | -P] [--whitelist | -W] ./whitelisted-alerts.csv
```
Create a summarized accessibility report of the web pages grouped by the WCAG indices. If the option `--pages` is set, the report will be generated per page.
