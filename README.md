# fixed-width-parser

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/keawade/fixed-width-parser/npm-publish/master)
![npm](https://img.shields.io/npm/v/fixed-width-parser)
![NPM](https://img.shields.io/npm/l/fixed-width-parser)
![Snyk Vulnerabilities for npm package version](https://img.shields.io/snyk/vulnerabilities/npm/fixed-width-parser)

`fixed-width-parser` is a node module for parsing data to and from fixed width string
formats.

## Install

```shell
npm install fixed-width-parser
```

## Usage

### Parse

```javascript
const { FixedWidthParser } = require('fixed-width-parser');

const fixedWidthParser = new FixedWidthParser([
  {
    type: 'int',
    name: 'age',
    width: 2,
  },
  {
    name: 'name',
    width: 12,
  },
]);

const input = `42         bob
21       alice
33        jeff`;

const result = fixedWidthParser.parse(input);
```

`result` is an array with the following content:

```json
[
  {
    "age": 42,
    "name": "bob"
  },
  {
    "age": 21,
    "name": "alice"
  },
  {
    "age": 33,
    "name": "jeff"
  }
]
```

#### Parse Options

```typescript
interface IParseOptions {
  /**
   * Value to return when value parses as falsy:
   *
   * - `'undefined'` = `undefined`
   * - `'null'` = `null`
   * - `'passthrough'` = return the original falsy value
   */
  falsyFallback: FalsyFallback;
}
```

### Unparse

```javascript
const { FixedWidthParser } = require('fixed-width-parser');

const fixedWidthParser = new FixedWidthParser([
  {
    type: 'int',
    name: 'age',
    width: 2,
  },
  {
    name: 'name',
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
]

const result = fixedWidthParser.unparse(input);
```

`result` is a string with the following content:

```text
42         bob
21       alice
33        jeff
```

### Unparse Options

```typescript
interface IUnparseOptions {
  // Allows truncating values that are too long instead of throwing
  // default: false
  truncate: boolean;
}
```

## Config

When initializing a new instance of the `FixedWidthParser` class, you must provide
an array of parse configs. These configs define how to convert between lines of
text and json objects by providing a mapping between segments of text and object keys.

All parse configs share the following properties:

```typescript
interface IBaseParseConfig {
  // default: 'string'
  type?: string;
  // number of characters used in fixed width string for this field
  // required
  width: number;
  // zero-based index of starting character in fixed width string for this field
  // required
  start: number;
  // default: 'start'
  padPosition?: 'start' | 'end';
  // default: ' '
  padString?: string;
  // value to use when unparsing if field in input is undefined
  default?: string | number;
}
```

An explicit `type` property can be provided in each parse config to specify what
data types to use for values parsed from strings. Several of these data types require
additional properties to be provided to fully define how parse/unparse values. 

```typescript
// Default config type
interface IStringParseConfig {
  type: 'string';
  // key name in JSON input/output
  // required
  name: string;
}
```

```typescript
// Will parse using parseInt
interface IIntegerParseConfig {
  type: 'int';
  // key name in JSON input/output
  // required
  name: string;
  // integer between 2 and 36 that represents the radix of the string
  // default: 10
  radix?: number;
}
```

```typescript
// Will parse using Number() after injecting a decimal if necessary
interface IFloatParseConfig {
  type: 'float';
  // key name in JSON input/output
  // required
  name: string;
  // whether or not to insert a decimal in formatted string
  // default: true
  insertDecimal?: boolean;
  // number of decimal places to assume if no decimal is present
  // default: 2
  decimalCount?: number;
}
```

```typescript
interface IDateParseConfig {
  type: 'date';
  // key name in JSON input/output
  // required
  name: string;
  // required
  // unicode date field symbol pattern
  fixedWidthFormat: string;
  // required
  // unicode date field symbol pattern
  jsonFormat: string;
}
```

```typescript
interface IBooleanParseConfig {
  type: 'bool';
  // key name in JSON input/output
  // required
  name: string;
  // required
  // fixed width string value to parse as true
  trueValue: string;
  // required
  // fixed width string value to parse as false
  falseValue: string;
}
```

```typescript
interface ISkipParseConfig {
  type: 'skip';
}
```

### Parse Config Validation

When constructing a new `FixedWidthParser` instance the provided parse config will
be validated. If any errors are detected an array of validation errors will be thrown
to help you find and correct the invalid configs.

```typescript
interface IParseConfigValidationError {
  // Index of the invalid parse config
  index: number;
  // The invalid parse config
  config: ParseConfig;
  // List of issues detected in the parse config
  errors: string[];
}
```

## Thanks

A huge thanks to @SteveyPugs for his work on `fixy` which served as inspiration
for `fixed-width-parser`! `fixed-width-parser` started out as a fork of `fixy` and
evolved into its own library when I got carried away and implemented a new high-level
API.
