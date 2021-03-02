import { ICharacterWhitelist } from './ICharacterWhitelist';

export interface IFixedWidthParserOptions {
  /**
   * Will throw an error if config widths do not add up to this value.
   */
  expectedFullWidth?: number;
  /**
   * Default behavior used if `truncate` is not set on a ParseConfig.
   */
  truncate?: boolean;
  /**
   * Specifies if only certain characters should be allowed, and if so, which
   * ones; all other characters are removed.
   */
  characterWhitelist?: ICharacterWhitelist;
}
