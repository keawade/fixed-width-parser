import { FixedWidthParser } from '../src/FixedWidthParser';

describe('FixedWidthParser', () => {
  it('should do stuff', () => {
    const parser = new FixedWidthParser([
      { type: 'string', name: 'foo', start: 0, width: 8 },
      { type: 'number', name: 'bar', start: 8, width: 4, padChar: '0' },
    ]);

    const actual = parser.parse('   hello0042\n goodbye0069');

    expect(actual).toContainEqual([
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
