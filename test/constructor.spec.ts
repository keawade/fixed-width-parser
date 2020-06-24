import { FixedWidthParser, default as DefaultImportFixedWidthParser } from '../src';
import { ParseConfig } from '../src/interfaces/ParseConfig';

describe('constructor', () => {
  it('should construct with valid arguments', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        name: 'Test',
        width: 1,
        start: 0,
      },
    ]);

    expect(fixedWidthParser).toBeInstanceOf(FixedWidthParser);
  });

  it('should be importable as the default import', () => {
    const fixedWidthParser = new DefaultImportFixedWidthParser([
      {
        name: 'Test',
        width: 1,
        start: 0,
      },
    ]);

    expect(fixedWidthParser).toBeInstanceOf(FixedWidthParser);
  });

  it('should throw an error if passed an empty array', () => {
    try {
      new FixedWidthParser([]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.message).toBe('Invalid parse config! Parse config is empty!');
    }
  });

  it('should throw an error if width is not greater than zero', () => {
    try {
      new FixedWidthParser([
        {
          name: 'Test',
          width: 0,
          start: 0,
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual('Width must be greater than zero.');
    }
  });

  it('should throw an error start is not defined', () => {
    try {
      new FixedWidthParser([
        {
          name: 'Test',
          width: 42,
        } as ParseConfig,
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual('Start must be defined.');
    }
  });

  it('should throw an error if full width does not match expected full width', () => {
    try {
      new FixedWidthParser(
        [
          {
            name: 'Test',
            width: 2,
            start: 0,
          },
        ],
        { expectedFullWidth: 42 }
      );
      fail('should have thrown an error');
    } catch (err) {
      expect(err.message).toBe(
        'Calculated full width (2) does not match asserted full width (42)!'
      );
    }
  });

  it('should throw an error if a provided default value will not fit in the specified width', () => {
    try {
      new FixedWidthParser([
        {
          name: 'Test',
          width: 2,
          start: 0,
          default: 'two long',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual('Default value will not fit in the specified width.');
    }
  });

  it('should throw an error if bool type not provided a trueValue', () => {
    try {
      new FixedWidthParser([
        {
          type: 'bool',
          name: 'Test',
          width: 1,
          start: 0,
          falseValue: 'F',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual("Missing property 'trueValue'.");
    }
  });

  it('should throw an error if bool type not provided a falseValue', () => {
    try {
      new FixedWidthParser([
        {
          type: 'bool',
          name: 'Test',
          width: 1,
          start: 0,
          trueValue: 'T',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual("Missing property 'falseValue'.");
    }
  });

  it('should throw an error if date type not provided a fixedWidthFormat', () => {
    try {
      new FixedWidthParser([
        {
          type: 'date',
          name: 'Test',
          width: 1,
          start: 0,
          jsonFormat: 'yyyy-MM-dd',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual("Missing property 'fixedWidthFormat'.");
    }
  });

  it('should throw an error if date type not provided a jsonFormat', () => {
    try {
      new FixedWidthParser([
        {
          type: 'date',
          name: 'Test',
          width: 1,
          start: 0,
          fixedWidthFormat: 'yyyyMMdd',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual("Missing property 'jsonFormat'.");
    }
  });

  it('should be able to throw multiple errors', () => {
    try {
      new FixedWidthParser([
        {
          type: 'date',
          name: 'InvalidOne',
          width: 1,
          start: 0,
        },
        {
          name: 'ValidOne',
          width: 42,
          start: 1,
        },
        {
          name: 'InvalidTwo',
          width: 0,
          start: 43,
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(2);

      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(2);
      expect(err[0].errors).toContainEqual("Missing property 'fixedWidthFormat'.");
      expect(err[0].errors).toContainEqual("Missing property 'jsonFormat'.");

      expect(err[1].index).toBe(2);
      expect(err[1].errors).toHaveLength(1);
      expect(err[1].errors).toContainEqual('Width must be greater than zero.');
    }
  });

  it('should throw an error if padChar is too long', () => {
    try {
      new FixedWidthParser([
        {
          name: 'test',
          width: 10,
          start: 0,
          padChar: '123',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual('padChar can only be a single character.');
    }
  });

  it('should throw an error if int is padded with non-zero number', () => {
    try {
      new FixedWidthParser([
        {
          type: 'int',
          name: 'test',
          width: 10,
          start: 0,
          padChar: '1',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual("Cannot pad numbers with numbers other than '0'.");
    }
  });

  it('should throw an error if int padding is configured as end', () => {
    try {
      new FixedWidthParser([
        {
          type: 'int',
          name: 'test',
          width: 10,
          start: 0,
          padChar: '0',
          padPosition: 'end',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual('Cannot pad the end of numbers.');
    }
  });

  it('should throw an error if float is padded with non-zero number', () => {
    try {
      new FixedWidthParser([
        {
          type: 'float',
          name: 'test',
          width: 10,
          start: 0,
          padChar: '1',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual("Cannot pad numbers with numbers other than '0'.");
    }
  });

  it('should throw an error if float padding is configured as end', () => {
    try {
      new FixedWidthParser([
        {
          type: 'float',
          name: 'test',
          width: 10,
          start: 0,
          padChar: '0',
          padPosition: 'end',
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual('Cannot pad the end of numbers.');
    }
  });

  it('should throw an error if float config requests too many decimals than can fit in width', () => {
    try {
      new FixedWidthParser([
        {
          type: 'float',
          name: 'test',
          width: 10,
          start: 0,
          padChar: '0',
          decimalCount: 11,
        },
      ]);
      fail('should have thrown an error');
    } catch (err) {
      expect(err.length).toBe(1);
      expect(err[0].index).toBe(0);
      expect(err[0].errors).toHaveLength(1);
      expect(err[0].errors).toContainEqual(
        "Cannot have '11' decimals when field is only '10' char wide."
      );
    }
  });
});
