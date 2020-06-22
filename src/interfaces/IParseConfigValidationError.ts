import { ParseConfig } from './ParseConfig';

export interface IParseConfigValidationError {
  index: number;
  config: ParseConfig;
  errors: string[];
}
