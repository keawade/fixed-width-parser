import { FalsyFallback } from './IParseOptions';

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
  falsyFallback?: FalsyFallback;
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
  mend?: 'floor' | 'ceil' | 'round' | 'error';
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
  tryParsingRawValueBeforeFallback: boolean;
}

export interface IBooleanParseConfig extends IBaseParseConfig {
  type: 'bool';
  name: string;
  trueValue: string;
  falseValue: string;
}
