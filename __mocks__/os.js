/* eslint-disable @typescript-eslint/no-var-requires */

const os = jest.createMockFromModule('os');
function homedir() {
  return '~/homedir';
}

os.homedir = homedir;

module.exports = os;
