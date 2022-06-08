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

  it('should parse int segments with falsyFallBack options', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'int',
        name: 'a',
        width: 2,
        start: 0,
        falsyFallback: 'passthrough',
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

  it('should parse float segments with falsyFallback options', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'float',
        name: 'a',
        width: 7,
        start: 0,
        decimalCount: 5,
        falsyFallback: 'passthrough',
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

  it('should parse float segments with implicit decimal and leading 0 padding with falsyFallback options', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'float',
        name: 'a',
        width: 10,
        start: 0,
        padChar: '0',
        padPosition: 'start',
        decimalCount: 3,
        falsyFallback: 'undefined',
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

    const actual = fixedWidthParser.parse('y\nn');

    expect(actual).toStrictEqual([
      {
        a: true,
      },
      {
        a: false,
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

  it('should handle falsy fallback options', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'date',
        name: 'a',
        width: 6,
        start: 0,
        padChar: '0',
        falsyFallback: 'passthrough',
        jsonFormat: 'HH:mm:ss',
        fixedWidthFormat: 'HHmmss',
        tryParsingRawValueBeforeFallback: true,
      },
    ]);

    const actual = fixedWidthParser.parse('123000\n000bad\n030000');

    expect(actual).toStrictEqual([
      {
        a: '12:30:00',
      },
      {
        a: 'bad',
      },
      {
        a: '03:00:00',
      },
    ]);
  });

  it('should parse date segments with falsyFallback options', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'date',
        name: 'a',
        width: 8,
        start: 0,
        jsonFormat: 'yyyy_MM_dd',
        fixedWidthFormat: 'yyyyMMdd',
        falsyFallback: 'undefined',
      },
    ]);

    const actual = fixedWidthParser.parse('20200621\nnotvalid');

    expect(actual).toStrictEqual([
      {
        a: '2020_06_21',
      },
      {
        a: undefined,
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

  it('should parse string segment and leave the specified characters', () => {
    const fixedWidthParser = new FixedWidthParser(
      [
        {
          name: 'a',
          width: 18,
          start: 0,
          padChar: '0',
        },
      ],
      {
        characterWhitelist: {
          special: false,
          extended: false,
          other: [' '],
        },
      },
    );

    const actual = fixedWidthParser.parse('   ヶ丘２丁?�ABC\u0000');

    expect(actual).toStrictEqual([
      {
        a: '   ABC',
      },
    ]);
  });

  it('should parse string segment and leave the specified characters', () => {
    const fixedWidthParser = new FixedWidthParser(
      [
        {
          name: 'a',
          width: 18,
          start: 0,
          padChar: '0',
          falsyFallback: 'undefined',
        },
      ],
      {
        characterWhitelist: {
          special: false,
          extended: false,
          other: [' '],
        },
      },
    );

    const actual = fixedWidthParser.parse('   ヶ丘２丁?�ABC\u0000');

    expect(actual).toStrictEqual([
      {
        a: '   ABC',
      },
    ]);
  });

  it('should parse float segment after removing alphabetic characters', () => {
    const fixedWidthParser = new FixedWidthParser(
      [
        {
          type: 'float',
          name: 'a',
          width: 10,
          start: 0,
          padChar: '0',
          padPosition: 'start',
          decimalCount: 10,
        },
      ],
      { characterWhitelist: { alpha: false } },
    );

    const actual = fixedWidthParser.parse('A000B0009C');

    expect(actual).toStrictEqual([
      {
        a: 0.0000000009,
      },
    ]);
  });

  it('should parse int segment after removing special characters', () => {
    const fixedWidthParser = new FixedWidthParser(
      [
        {
          type: 'int',
          name: 'a',
          width: 4,
          start: 0,
        },
      ],
      { characterWhitelist: { special: false } },
    );

    const actual = fixedWidthParser.parse(' 0.1');

    expect(actual).toStrictEqual([
      {
        a: 1,
      },
    ]);
  });

  it('should parse bool segment after removing numeric characters', () => {
    const fixedWidthParser = new FixedWidthParser(
      [
        {
          type: 'bool',
          name: 'a',
          width: 3,
          start: 0,
          trueValue: 'y',
          falseValue: 'n',
        },
      ],
      { characterWhitelist: { numeric: false } },
    );

    const actual = fixedWidthParser.parse('01y');

    expect(actual).toStrictEqual([
      {
        a: true,
      },
    ]);
  });

  it('should parse bool segment after removing numeric characters with falsyFallback options', () => {
    const fixedWidthParser = new FixedWidthParser(
      [
        {
          type: 'bool',
          name: 'a',
          width: 3,
          start: 0,
          trueValue: 'y',
          falseValue: 'n',
          falsyFallback: 'undefined',
        },
      ],
      { characterWhitelist: { numeric: false } },
    );

    const actual = fixedWidthParser.parse('01');

    expect(actual).toStrictEqual([
      {
        a: undefined,
      },
    ]);
  });

  it('should parse date segment after removing non-printable ASCII characters', () => {
    const fixedWidthParser = new FixedWidthParser(
      [
        {
          type: 'date',
          name: 'a',
          width: 11,
          start: 0,
          jsonFormat: 'yyyy_MM_dd',
          fixedWidthFormat: 'yyyyMMdd',
        },
      ],
      { characterWhitelist: { extended: false } },
    );

    const actual = fixedWidthParser.parse('2020�06�21�\nnotvalid');

    expect(actual).toStrictEqual([
      {
        a: '2020_06_21',
      },
      {
        a: null,
      },
    ]);
  });

  it('should respect mending type of ceil', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'int',
        name: 'a',
        width: 3,
        start: 0,
        mend: 'ceil',
      },
    ]);

    const actual = fixedWidthParser.parse('1.6');

    expect(actual).toStrictEqual([
      {
        a: 2,
      },
    ]);
  });

  it('should respect mending type of round', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'int',
        name: 'a',
        width: 3,
        start: 0,
        mend: 'round',
      },
    ]);

    const actual = fixedWidthParser.parse('1.4');

    expect(actual).toStrictEqual([
      {
        a: 1,
      },
    ]);
  });

  it('should respect multiple mending types', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'int',
        name: 'a',
        width: 3,
        start: 0,
      },
      {
        type: 'int',
        name: 'b',
        width: 3,
        start: 3,
        mend: 'floor',
      },
      {
        type: 'int',
        name: 'c',
        width: 3,
        start: 6,
        mend: 'round',
      },
    ]);

    const actual = fixedWidthParser.parse('1.41.41.4');

    expect(actual).toStrictEqual([
      {
        a: 1,
        b: 1,
        c: 1,
      },
    ]);
  });

  it('should respect mending type of error', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'int',
        name: 'a',
        width: 3,
        start: 0,
        mend: 'error',
      },
    ]);

    try {
      fixedWidthParser.parse('1.1');
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });

  describe('options', () => {
    describe('falsyFallback', () => {
      describe('falsyFallback = passthrough', () => {
        it('should handle empty string fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'string',
              name: 'a',
              width: 10,
              start: 0,
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'passthrough',
          });

          expect(actual).toStrictEqual([
            {
              a: '',
            },
          ]);
        });

        it('should handle empty int fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'int',
              name: 'a',
              width: 10,
              start: 0,
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'passthrough',
          });

          expect(actual).toStrictEqual([
            {
              a: 0,
            },
          ]);
        });

        it('should handle empty float fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'float',
              name: 'a',
              width: 10,
              start: 0,
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'passthrough',
          });

          expect(actual).toStrictEqual([
            {
              a: 0,
            },
          ]);
        });

        it('should handle empty date fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'date',
              name: 'a',
              width: 10,
              start: 0,
              fixedWidthFormat: 'yyyy-MM-dd',
              jsonFormat: 'yyyy-MM-dd',
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'passthrough',
          });

          expect(actual).toStrictEqual([
            {
              a: null,
            },
          ]);
        });

        it('should handle empty bool fields', () => {
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

          const actual = fixedWidthParser.parse(' ', {
            falsyFallback: 'passthrough',
          });

          expect(actual).toStrictEqual([
            {
              a: false,
            },
          ]);
        });
      });

      describe('falsyFallback = undefined', () => {
        it('should handle empty string fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'string',
              name: 'a',
              width: 10,
              start: 0,
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'undefined',
          });

          expect(actual).toStrictEqual([
            {
              a: undefined,
            },
          ]);
        });

        it('should handle empty int fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'int',
              name: 'a',
              width: 10,
              start: 0,
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'undefined',
          });

          expect(actual).toStrictEqual([
            {
              a: undefined,
            },
          ]);
        });

        it('should handle empty float fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'float',
              name: 'a',
              width: 10,
              start: 0,
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'undefined',
          });

          expect(actual).toStrictEqual([
            {
              a: undefined,
            },
          ]);
        });

        it('should handle empty date fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'date',
              name: 'a',
              width: 10,
              start: 0,
              fixedWidthFormat: 'yyyy-MM-dd',
              jsonFormat: 'yyyy-MM-dd',
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'undefined',
          });

          expect(actual).toStrictEqual([
            {
              a: undefined,
            },
          ]);
        });

        it('should handle empty bool fields', () => {
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

          const actual = fixedWidthParser.parse(' ', {
            falsyFallback: 'undefined',
          });

          expect(actual).toStrictEqual([
            {
              a: undefined,
            },
          ]);
        });
      });

      describe('falsyFallback = null', () => {
        it('should handle empty string fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'string',
              name: 'a',
              width: 10,
              start: 0,
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'null',
          });

          expect(actual).toStrictEqual([
            {
              a: null,
            },
          ]);
        });

        it('should handle empty int fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'int',
              name: 'a',
              width: 10,
              start: 0,
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'null',
          });

          expect(actual).toStrictEqual([
            {
              a: null,
            },
          ]);
        });

        it('should handle empty float fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'float',
              name: 'a',
              width: 10,
              start: 0,
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'null',
          });

          expect(actual).toStrictEqual([
            {
              a: null,
            },
          ]);
        });

        it('should handle empty date fields', () => {
          const fixedWidthParser = new FixedWidthParser([
            {
              type: 'date',
              name: 'a',
              width: 10,
              start: 0,
              fixedWidthFormat: 'yyyy-MM-dd',
              jsonFormat: 'yyyy-MM-dd',
            },
          ]);

          const actual = fixedWidthParser.parse('          ', {
            falsyFallback: 'null',
          });

          expect(actual).toStrictEqual([
            {
              a: null,
            },
          ]);
        });

        it('should handle empty bool fields', () => {
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

          const actual = fixedWidthParser.parse(' ', {
            falsyFallback: 'null',
          });

          expect(actual).toStrictEqual([
            {
              a: null,
            },
          ]);
        });
      });
    });
  });
});
