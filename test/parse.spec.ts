import { FixedWidthParser } from '../src';

describe('FixedWidthParser.parse', () => {
  it('should throw an error if the input is empty', () => {
    try {
      const fixedWidthParser = new FixedWidthParser([
        {
          name: 'Age',
          width: 2,
          start: 0,
          type: 'int',
        },
      ]);

      fixedWidthParser.parse('');
      fail('should have thrown an error');
    } catch (err) {
      expect(err.message).toBe('Invalid input! Input is empty!');
    }
  });

  it('should throw an error if the input is not a string', () => {
    try {
      const fixedWidthParser = new FixedWidthParser([
        {
          name: 'Age',
          width: 2,
          start: 0,
          type: 'int',
        },
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fixedWidthParser as any).parse(42);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.message).toBe('Invalid input! Input must be a string!');
    }
  });

  it('should skip configs with no name', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'a',
        width: 2,
        start: 0,
      },
      {
        width: 2,
        start: 2,
      },
      {
        name: 'c',
        width: 2,
        start: 4,
      },
    ]);

    const actual = fixedWidthParser.parse('aabbcc');

    expect(actual).toStrictEqual([
      {
        a: 'aa',
        c: 'cc',
      },
    ]);
  });

  it('should skip configs of type skip', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'a',
        width: 2,
        start: 0,
      },
      {
        type: 'skip',
        name: 'b',
        width: 2,
        start: 2,
      },
      {
        name: 'c',
        width: 2,
        start: 4,
      },
    ]);

    const actual = fixedWidthParser.parse('aabbcc');

    expect(actual).toStrictEqual([
      {
        a: 'aa',
        b: undefined,
        c: 'cc',
      },
    ]);
  });

  it('should parse int segments', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'int',
        name: 'a',
        width: 2,
        start: 0,
      },
    ]);

    const actual = fixedWidthParser.parse(' 1');

    expect(actual).toStrictEqual([
      {
        a: 1,
      },
    ]);
  });

  it('should respect radix', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'int',
        name: 'a',
        width: 3,
        start: 0,
        radix: 8,
      },
    ]);

    const actual = fixedWidthParser.parse(' 31');

    expect(actual).toStrictEqual([
      {
        a: 25,
      },
    ]);
  });

  it('should parse float segments', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'float',
        name: 'a',
        width: 7,
        start: 0,
        decimalCount: 5,
      },
    ]);

    const actual = fixedWidthParser.parse('3.14159');

    expect(actual).toStrictEqual([
      {
        a: 3.14159,
      },
    ]);
  });

  it('should parse float segments without explicit decimal place', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'float',
        name: 'a',
        width: 6,
        start: 0,
        decimalCount: 5,
      },
    ]);

    const actual = fixedWidthParser.parse('314159');

    expect(actual).toStrictEqual([
      {
        a: 3.14159,
      },
    ]);
  });

  it('should parse float segments without assuming decimal by default', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'float',
        name: 'a',
        width: 6,
        start: 0,
      },
    ]);

    const actual = fixedWidthParser.parse('314159');

    expect(actual).toStrictEqual([
      {
        a: 3141.59,
      },
    ]);
  });

  it('should parse float segments with implicit decimal and leading # padding', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'float',
        name: 'a',
        width: 10,
        start: 0,
        padChar: '#',
        padPosition: 'start',
        decimalCount: 3,
      },
    ]);

    const actual = fixedWidthParser.parse('####314159');

    expect(actual).toStrictEqual([
      {
        a: 314.159,
      },
    ]);
  });

  it('should parse float segments with implicit decimal and leading 0 padding', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'float',
        name: 'a',
        width: 10,
        start: 0,
        padChar: '0',
        padPosition: 'start',
        decimalCount: 3,
      },
    ]);

    const actual = fixedWidthParser.parse('0000314159');

    expect(actual).toStrictEqual([
      {
        a: 314.159,
      },
    ]);
  });

  it('should parse float segments with more decimals than the length of the trimmed string', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'float',
        name: 'a',
        width: 10,
        start: 0,
        padChar: '0',
        padPosition: 'start',
        decimalCount: 3,
      },
    ]);

    const actual = fixedWidthParser.parse('0000000009');

    expect(actual).toStrictEqual([
      {
        a: 0.009,
      },
    ]);
  });

  it('should parse float segments with decimals equal to the length of the width', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'float',
        name: 'a',
        width: 10,
        start: 0,
        padChar: '0',
        padPosition: 'start',
        decimalCount: 10,
      },
    ]);

    const actual = fixedWidthParser.parse('0000000009');

    expect(actual).toStrictEqual([
      {
        a: 0.0000000009,
      },
    ]);
  });

  it('should parse bool segments', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'bool',
        name: 'a',
        width: 1,
        start: 0,
        trueValue: 'y',
        falseValue: 'n',
      },
    ]);

    const actual = fixedWidthParser.parse('y\nn\nq');

    expect(actual).toStrictEqual([
      {
        a: true,
      },
      {
        a: false,
      },
      {
        a: null,
      },
    ]);
  });

  it('should parse date segments', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'date',
        name: 'a',
        width: 8,
        start: 0,
        jsonFormat: 'yyyy_MM_dd',
        fixedWidthFormat: 'yyyyMMdd',
      },
    ]);

    const actual = fixedWidthParser.parse('20200621\nnotvalid');

    expect(actual).toStrictEqual([
      {
        a: '2020_06_21',
      },
      {
        a: null,
      },
    ]);
  });

  it('should remove padding', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'a',
        width: 10,
        start: 0,
      },
    ]);

    const actual = fixedWidthParser.parse('       aaa');

    expect(actual).toStrictEqual([
      {
        a: 'aaa',
      },
    ]);
  });

  it('should remove arbitrary padding', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'a',
        width: 10,
        start: 0,
        padChar: 'b',
      },
    ]);

    const actual = fixedWidthParser.parse('bbbbbbbaaa');

    expect(actual).toStrictEqual([
      {
        a: 'aaa',
      },
    ]);
  });

  it('should remove arbitrary padding from end', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'a',
        width: 10,
        start: 0,
        padChar: 'b',
        padPosition: 'end',
      },
    ]);

    const actual = fixedWidthParser.parse('aaabbbbbbb');

    expect(actual).toStrictEqual([
      {
        a: 'aaa',
      },
    ]);
  });
});
