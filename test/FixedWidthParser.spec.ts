import { FixedWidthParser } from '../src/FixedWidthParser';

// TODO: Test streaming input

describe('FixedWidthParser', () => {
  it('should do stuff', () => {
    const parser = new FixedWidthParser([
      { type: 'string', name: 'foo', start: 0, width: 8 },
      { type: 'integer', name: 'bar', start: 8, width: 4 },
    ]);

    const actual = parser.parse('   hello0042\n goodbye0069');

    expect(actual).toEqual([
      {
        foo: 'hello',
        bar: 42,
      },
      {
        foo: 'goodbye',
        bar: 69,
      },
    ]);
  });
});
