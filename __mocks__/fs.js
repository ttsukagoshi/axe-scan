/* eslint-disable @typescript-eslint/no-var-requires */

const fs = jest.createMockFromModule('fs');

let mockFiles = {};
function __setMockFiles(newMockFiles) {
  mockFiles = {};
  Object.assign(mockFiles, newMockFiles);
}

function existsSync(filePath) {
  return mockFiles[filePath] ? true : false;
}

function readFileSync(filePath) {
  return mockFiles[filePath];
}

fs.existsSync = existsSync;
fs.readFileSync = readFileSync;
fs.__setMockFiles = __setMockFiles;

module.exports = fs;
