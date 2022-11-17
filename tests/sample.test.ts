function testSum(a: number, b: number): number {
  return a + b;
}

const numberA = 5;
const numberB = 6;

describe('A sample test written in ts', () => {
  test('sample', () => {
    expect(testSum(numberA, numberB)).toBe(11);
  });
});
