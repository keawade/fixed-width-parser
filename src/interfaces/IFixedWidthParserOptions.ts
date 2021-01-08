export interface IFixedWidthParserOptions {
  /**
   * Will throw an error if config widths do not add up to this value.
   */
  expectedFullWidth?: number;
  /**
   * Default behavior used if `truncate` is not set on a ParseConfig.
   */
  truncate?: boolean;
}
