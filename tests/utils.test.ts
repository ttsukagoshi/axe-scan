import { convertStringForCsv } from '../src/utils';

const patterns = [
  {
    text: 'test,pattern,with,commas,only',
    expected: 'test-pattern-with-commas-only',
  },
  {
    text: `test\npattern\r\nwith\n\rline\rbreaks
    in multiple\nrows
    `,
    expected: 'test pattern with line breaks in multiple rows',
  },
];

describe('Test for utils.ts', () => {
  describe.each(patterns)(
    'Test convertStringForCsv on $test',
    ({ text, expected }) => {
      expect(convertStringForCsv(text)).toBe(expected);
    }
  );
});
