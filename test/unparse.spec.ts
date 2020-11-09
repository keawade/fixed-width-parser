import { FixedWidthParser } from '../src';
import { format as formatDate, parseISO } from 'date-fns';

describe('FixedWidthParser.unparse', () => {
  it('should pad start values with spaces by default', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'Age',
        start: 0,
        width: 7,
      },
      {
        name: 'Initial',
        start: 7,
        width: 4,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        Age: 30,
        Initial: 'SJP',
      },
      {
        Age: 20,
        Initial: 'CCS',
      },
    ]);

    expect(actual).toStrictEqual('     30 SJP\n     20 CCS');
  });

  it('should respect padPosition', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'Age',
        start: 0,
        width: 7,
        padPosition: 'end',
      },
      {
        name: 'Initial',
        start: 7,
        width: 4,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        Age: 30,
        Initial: 'SJP',
      },
      {
        Age: 20,
        Initial: 'CCS',
      },
    ]);

    expect(actual).toStrictEqual('30      SJP\n20      CCS');
  });

  it('should respect padString', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'Age',
        start: 0,
        width: 7,
        padChar: '#',
      },
      {
        name: 'Initial',
        start: 7,
        width: 4,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        Age: 30,
        Initial: 'SJP',
      },
      {
        Age: 20,
        Initial: 'CCS',
      },
    ]);

    expect(actual).toStrictEqual('#####30 SJP\n#####20 CCS');
  });

  it('should respect padPosition and padString', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'Age',
        start: 0,
        width: 7,
        padPosition: 'end',
        padChar: '#',
      },
      {
        name: 'Initial',
        start: 7,
        width: 4,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        Age: 30,
        Initial: 'SJP',
      },
      {
        Age: 20,
        Initial: 'CCS',
      },
    ]);

    expect(actual).toStrictEqual('30##### SJP\n20##### CCS');
  });

  it('should allow default values', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'Age',
        start: 0,
        width: 7,
        default: 20,
      },
      {
        name: 'Initial',
        start: 7,
        width: 4,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        Initial: 'SJP',
      },
    ]);

    expect(actual).toStrictEqual('     20 SJP');
  });

  it('should handle null or undefined values', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'Age',
        start: 0,
        width: 7,
        padChar: '0',
      },
      {
        name: 'Initial',
        start: 7,
        width: 4,
        padChar: '1',
      },
      {
        name: 'Other',
        start: 11,
        width: 4,
        default: 'what',
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        Age: undefined,
        Initial: null,
      },
    ]);

    expect(actual).toStrictEqual('00000001111what');
  });

  it('should throw error if value cannot fit in defined width', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'Name',
        start: 0,
        width: 7,
      },
    ]);

    try {
      fixedWidthParser.unparse([{ Name: 'Alexander' }]);
      fail('should have thrown error');
    } catch (err) {
      expect(err.message).toBe("Unable to parse value 'Alexander' into width of '7'!");
    }
  });

  it('should optionally truncate values that are too long', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'Name',
        start: 0,
        width: 7,
      },
    ]);

    const actual = fixedWidthParser.unparse(
      [
        {
          Name: 'Alexander',
        },
      ],
      {
        truncate: true,
      },
    );

    expect(actual).toStrictEqual('Alexand');
  });

  it('should properly handle date values', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'firstName',
        start: 0,
        width: 12,
      },
      {
        type: 'date',
        name: 'birthday',
        start: 12,
        width: 8,
        jsonFormat: 'MM/dd/yyyy',
        fixedWidthFormat: 'yyyyMMdd',
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        firstName: 'Billy',
        birthday: formatDate(parseISO('1990-08-11'), 'MM/dd/yyyy'),
      },
    ]);

    expect(actual).toStrictEqual('       Billy19900811');
  });

  it('should handle invalid date', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'firstName',
        start: 0,
        width: 12,
      },
      {
        type: 'date',
        name: 'birthday',
        start: 12,
        width: 8,
        jsonFormat: 'MM/dd/yyyy',
        fixedWidthFormat: 'yyyyMMdd',
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        firstName: 'Billy',
        birthday: 'notvalid',
      },
    ]);

    expect(actual).toStrictEqual('       Billy        ');
  });

  it('should properly handle float values', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'accountId',
        start: 0,
        width: 36,
      },
      {
        type: 'float',
        name: 'balance',
        start: 36,
        width: 32,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        accountId: '604d7d16-36be-47fd-ab70-e9c93b34c91f',
        balance: 12345.1234,
      },
    ]);

    expect(actual).toStrictEqual(
      '604d7d16-36be-47fd-ab70-e9c93b34c91f                        12345.12',
    );
  });

  it('should respect decimalCount', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'accountId',
        start: 0,
        width: 36,
      },
      {
        type: 'float',
        name: 'balance',
        start: 36,
        width: 32,
        decimalCount: 5,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        accountId: '604d7d16-36be-47fd-ab70-e9c93b34c91f',
        balance: 12345.1234,
      },
    ]);

    expect(actual).toStrictEqual(
      '604d7d16-36be-47fd-ab70-e9c93b34c91f                     12345.12340',
    );
  });

  it('should respect leading and trailing 0s', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'accountId',
        start: 0,
        width: 36,
      },
      {
        padChar: '0',
        padPosition: 'start',
        type: 'float',
        decimalCount: 3,
        insertDecimal: false,
        name: 'balance',
        start: 36,
        width: 5,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        accountId: '604d7d16-36be-47fd-ab70-e9c93b34c91f',
        balance: 5.5,
      },
    ]);

    expect(actual).toStrictEqual('604d7d16-36be-47fd-ab70-e9c93b34c91f05500');
  });

  it('should not add extra trailing 0s', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'accountId',
        start: 0,
        width: 36,
      },
      {
        padChar: '0',
        padPosition: 'start',
        type: 'float',
        decimalCount: 3,
        insertDecimal: false,
        name: 'balance',
        start: 36,
        width: 5,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        accountId: '604d7d16-36be-47fd-ab70-e9c93b34c91f',
        balance: 5.555,
      },
    ]);

    expect(actual).toStrictEqual('604d7d16-36be-47fd-ab70-e9c93b34c91f05555');
  });

  it('should default to a decimalCount of 2', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'accountId',
        start: 0,
        width: 36,
      },
      {
        padChar: '0',
        padPosition: 'start',
        type: 'float',
        insertDecimal: false,
        name: 'balance',
        start: 36,
        width: 5,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        accountId: '604d7d16-36be-47fd-ab70-e9c93b34c91f',
        balance: 5.555,
      },
    ]);

    expect(actual).toStrictEqual('604d7d16-36be-47fd-ab70-e9c93b34c91f00555');
  });

  it('should respect decimalCount even when there is no decimal', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'accountId',
        start: 0,
        width: 36,
      },
      {
        type: 'float',
        name: 'balance',
        start: 36,
        width: 32,
        decimalCount: 4,
        insertDecimal: false,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        accountId: '604d7d16-36be-47fd-ab70-e9c93b34c91f',
        balance: 12345,
      },
    ]);

    expect(actual).toStrictEqual(
      '604d7d16-36be-47fd-ab70-e9c93b34c91f                       123450000',
    );
  });

  it('should skip inserting decimal depending on config', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'accountId',
        start: 0,
        width: 36,
      },
      {
        type: 'float',
        name: 'balance',
        start: 36,
        width: 32,
        insertDecimal: false,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        accountId: '604d7d16-36be-47fd-ab70-e9c93b34c91f',
        balance: 12345.1234,
      },
    ]);

    expect(actual).toStrictEqual(
      '604d7d16-36be-47fd-ab70-e9c93b34c91f                         1234512',
    );
  });

  it('should properly handle int values', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'name',
        start: 0,
        width: 12,
      },
      {
        type: 'int',
        name: 'age',
        start: 12,
        width: 3,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        name: 'Billy',
        age: 42,
      },
    ]);

    expect(actual).toStrictEqual('       Billy 42');
  });

  it('should respect radix', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'name',
        start: 0,
        width: 12,
      },
      {
        type: 'int',
        name: 'age',
        start: 12,
        width: 3,
        radix: 8,
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        name: 'Billy',
        age: 25,
      },
    ]);

    expect(actual).toStrictEqual('       Billy 31');
  });

  it('should properly handle bool values', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'bool',
        name: 'test',
        start: 0,
        width: 3,
        trueValue: 'y',
        falseValue: 'n',
      },
    ]);

    const actual = fixedWidthParser.unparse([
      {
        test: true,
      },
      {
        test: false,
      },
    ]);

    expect(actual).toStrictEqual('  y\n  n');
  });

  it('should throw an error if input is not provided', () => {
    const fixedWidthParser = new FixedWidthParser([{ name: 'Age', start: 0, width: 7 }]);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fixedWidthParser as any).unparse();
      fail('should have thrown an error');
    } catch (err) {
      expect(err.message).toBe('Invalid input! Input is empty!');
    }
  });

  it('should throw an error if input is empty', () => {
    const fixedWidthParser = new FixedWidthParser([{ name: 'Age', start: 0, width: 7 }]);

    try {
      fixedWidthParser.unparse([]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.message).toBe('Invalid input! Input is empty!');
    }
  });

  it('should use default value if no config.name', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        start: 0,
        width: 1,
        default: 'a',
      },
    ]);

    const actual = fixedWidthParser.unparse([{}]);

    expect(actual).toStrictEqual('a');
  });
});
