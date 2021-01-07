export type ParseConfigInput = ParseConfig | IBaseParseConfig;

export type ParseConfig =
  | ISkipParseConfig
  | IIntegerParseConfig
  | IStringParseConfig
  | IFloatParseConfig
  | IDateParseConfig
  | IBooleanParseConfig;

interface IBaseParseConfig {
  type?: string;
  name?: string;
  width: number;
  start: number;
  level?: string;
  padPosition?: 'start' | 'end';
  padChar?: string;
  default?: string | number;
  truncate?: boolean;
}

export interface ISkipParseConfig extends IBaseParseConfig {
  type: 'skip';
}

export interface IStringParseConfig extends IBaseParseConfig {
  type: 'string';
  name: string;
}

export interface IIntegerParseConfig extends IBaseParseConfig {
  type: 'int';
  name: string;
  radix?: number;
}

export interface IFloatParseConfig extends IBaseParseConfig {
  type: 'float';
  name: string;
  insertDecimal?: boolean;
  decimalCount?: number;
}

export interface IDateParseConfig extends IBaseParseConfig {
  type: 'date';
  name: string;
  fixedWidthFormat: string;
  jsonFormat: string;
}

export interface IBooleanParseConfig extends IBaseParseConfig {
  type: 'bool';
  name: string;
  trueValue: string;
  falseValue: string;
}
