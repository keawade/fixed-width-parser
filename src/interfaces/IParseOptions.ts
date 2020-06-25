export type FalsyFallback = 'undefined' | 'null' | 'passthrough';

export interface IParseOptions {
  /**
   * Value to return when value parses as falsy:
   *
   * - `'undefined'` = `undefined`
   * - `'null'` = `null`
   * - `'passthrough'` = return the original falsy value
   */
  falsyFallback: FalsyFallback;
}
