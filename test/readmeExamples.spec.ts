import { FixedWidthParser } from '../src';

describe('readme examples', () => {
  it('should run the parse example', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'int',
        name: 'age',
        start: 0,
        width: 2,
      },
      {
        name: 'name',
        start: 2,
        width: 12,
      },
    ]);

    const input = `42         bob
21       alice
33        jeff`;

    const result = fixedWidthParser.parse(input);

    expect(result).toStrictEqual([
      {
        age: 42,
        name: 'bob',
      },
      {
        age: 21,
        name: 'alice',
      },
      {
        age: 33,
        name: 'jeff',
      },
    ]);
  });

  it('should run unparse example', () => {
    const fixedWidthParser = new FixedWidthParser([
      {
        type: 'int',
        name: 'age',
        start: 0,
        width: 2,
      },
      {
        name: 'name',
        start: 2,
        width: 12,
      },
    ]);

    const input = [
      {
        age: 42,
        name: 'bob',
      },
      {
        age: 21,
        name: 'alice',
      },
      {
        age: 33,
        name: 'jeff',
      },
    ];

    const result = fixedWidthParser.unparse(input);

    expect(result).toBe(`42         bob
21       alice
33        jeff`);
  });
});
