import { ParseConfig, ParseConfigInput } from './interfaces/ParseConfig';
import { JsonObject } from './interfaces/json';
import { IParseConfigValidationError } from './interfaces/IParseConfigValidationError';
import { splice } from './splice';
import { parse as parseToDate, isValid as isValidDate, format as formatDate } from 'date-fns';
import { IUnparseOptions } from './interfaces/IUnparseOptions';
import { trimString } from './trimString';

interface IFixedWidthParserOptions {
  /**
   * Will throw an error if config widths do not add up to this value.
   */
  expectedFullWidth?: number;
}

export class FixedWidthParser {
  private parseConfigMap: ParseConfig[];
  private fullWidth: number;

  /**
   * @param parseConfigMap Array of parse configs
   * @param options Additional options
   */
  constructor(parseConfigMap: ParseConfigInput[], options?: IFixedWidthParserOptions) {
    if (parseConfigMap.length <= 0) {
      throw new Error(`Invalid parse config! Parse config is empty!`);
    }

    this.parseConfigMap = parseConfigMap.sort((a, b) => a.start - b.start).map(this.applyDefaults);

    const validationErrors = this.parseConfigMap
      .map(this.validateParseConfigs)
      .filter((err) => err !== undefined);

    if (validationErrors.length > 0) {
      throw validationErrors;
    }

    this.fullWidth = this.parseConfigMap.reduce((prev, next) => prev + next.width, 0);

    if (options?.expectedFullWidth && this.fullWidth !== options.expectedFullWidth) {
      throw new Error(
        `Calculated full width (${this.fullWidth}) does not match asserted full width (${options.expectedFullWidth})!`
      );
    }
  }

  public parse(input: string): JsonObject[] {
    if (!input) {
      throw new Error('Invalid input! Input is empty!');
    }

    if (typeof input !== 'string') {
      throw new Error(`Invalid input! Input must be a string!`);
    }

    const lines = input.replace(/\r\n/g, '\n').split('\n');

    return lines.map(this.parseLine);
  }

  public unparse(input: unknown[], options?: Partial<IUnparseOptions>): string {
    if (!input || input.length <= 0) {
      throw new Error('Invalid input! Input is empty!');
    }

    const lines = input.map((obj) => {
      let line = '';

      for (const config of this.parseConfigMap) {
        let value = '';

        if (obj[config.name] === undefined || obj[config.name] === null) {
          value = '';
        } else {
          // Handle type specific conversion
          switch (config.type) {
            case 'float': {
              const numAsStr: string = obj[config.name].toString();
              const strippedDecimals = numAsStr.slice(
                0,
                numAsStr.indexOf('.') + (config.decimalCount ?? 2) + 1
              );
              value =
                config.insertDecimal ?? true
                  ? strippedDecimals
                  : strippedDecimals.replace(/\./g, '');
              break;
            }

            case 'int':
              value = obj[config.name].toString(config.radix ?? 10);
              break;

            case 'string':
              value = String(obj[config.name]);
              break;

            case 'bool':
              value = obj[config.name] ? config.trueValue : config.falseValue;
              break;

            case 'date': {
              const parsedDate = parseToDate(obj[config.name], config.jsonFormat, new Date());
              if (isValidDate(parsedDate)) {
                value = formatDate(parsedDate, config.fixedWidthFormat);
              }
              break;
            }
          }
        }

        // Handle default value
        if (!value && config.default !== undefined) {
          value = String(config.default);
        }

        // Handle padding
        if ((config.padPosition ?? 'start') === 'start') {
          value = value.padStart(config.width, config.padChar ?? ' ');
        } else {
          value = value.padEnd(config.width, config.padChar ?? ' ');
        }

        // Handle truncate or error
        if (value.length > config.width) {
          if (!options?.truncate) {
            throw new Error(`Unable to parse value '${value}' into width of '${config.width}'!`);
          }

          console.warn(
            `Truncating value '${value}' to '${value.slice(0, config.width)}' to fit in '${
              config.name
            }' width of '${config.width}'.`
          );

          value = value.slice(0, config.width);
        }

        // Append value to current line
        line += value;
      }

      return line;
    });

    return lines.join('\n');
  }

  private parseLine = (line: string): JsonObject =>
    this.parseConfigMap
      .map((config) => ({
        config,
        rawString: line.slice(config.start, config.start + config.width),
      }))
      .reduce(this.parseLineSegments, {});

  private parseLineSegments = (
    result: JsonObject,
    segment: { config: ParseConfig; rawString: string }
  ): JsonObject => {
    if (!segment.config.name) {
      return result;
    }

    return {
      ...result,
      [segment.config.name]: this.parseSegment(segment.config, segment.rawString),
    };
  };

  private parseSegment = (
    config: ParseConfig,
    rawString: string
  ): string | number | boolean | undefined => {
    // Strip out padding
    const trimmedString = trimString(
      rawString,
      config.padChar ?? ' ',
      config.padPosition ?? 'start'
    );

    // Parse remaining string
    switch (config.type) {
      case 'int':
        return parseInt(trimmedString, config.radix ?? 10);

      case 'float': {
        const decimalCount = config.decimalCount ?? 2;
        if (trimmedString.includes('.')) {
          return Number(trimmedString);
        }
        // Pad to original field width with 0's to ensure decimal can be injected
        const stringToParse = trimmedString.padStart(config.width, '0');
        return Number(splice(stringToParse, '.', stringToParse.length - 1 - decimalCount));
      }

      case 'bool':
        if (trimmedString === config.trueValue) {
          return true;
        }
        if (trimmedString === config.falseValue) {
          return false;
        }

        console.warn('Failed to parse to boolean value. Defaulting to null.');
        return null;

      case 'date': {
        const parsedDate = parseToDate(trimmedString, config.fixedWidthFormat, new Date());
        if (isValidDate(parsedDate)) {
          return formatDate(parsedDate, config.jsonFormat);
        }

        console.warn('Failed to parse to date value. Defaulting to null.');
        return null;
      }

      case 'skip':
        // handle skip with a name
        return undefined;

      case 'string':
      default:
        // TODO: Find a good way to warn of untrimmed values as they may indicate a misconfiguration
        return trimmedString;
    }
  };

  private applyDefaults = (parseConfig: ParseConfigInput): ParseConfig => {
    if (!parseConfig.type) {
      parseConfig.type = 'string';
    }

    return parseConfig as ParseConfig;
  };

  private validateParseConfigs = (
    parseConfig: ParseConfig,
    index: number
  ): IParseConfigValidationError | undefined => {
    const errorResponse: IParseConfigValidationError = {
      index,
      config: parseConfig,
      errors: [],
    };

    if (parseConfig.width === undefined || parseConfig.width === null || parseConfig.width <= 0) {
      errorResponse.errors.push(`Width must be greater than zero.`);
    }

    if (parseConfig.start === undefined || parseConfig.start === null) {
      errorResponse.errors.push(`Start must be defined.`);
    }

    if (parseConfig.padChar?.length > 1) {
      errorResponse.errors.push(`padChar can only be a single character.`);
    }

    if (parseConfig.default && parseConfig.default.toString().length > parseConfig.width) {
      errorResponse.errors.push(`Default value will not fit in the specified width.`);
    }

    switch (parseConfig.type) {
      case 'int':
      case 'float':
        if (/[1-9]/.test(parseConfig.padChar)) {
          errorResponse.errors.push(`Cannot pad numbers with numbers other than '0'.`);
        }

        if (parseConfig.padPosition === 'end') {
          errorResponse.errors.push(`Cannot pad the end of numbers.`);
        }

        if (parseConfig.type === 'float' && parseConfig.decimalCount > parseConfig.width) {
          errorResponse.errors.push(
            `Cannot have '${parseConfig.decimalCount}' decimals when field is only '${parseConfig.width}' char wide.`
          );
        }
        break;

      case 'bool':
        if (!parseConfig.trueValue) {
          errorResponse.errors.push(`Missing property 'trueValue'.`);
        }

        if (!parseConfig.falseValue) {
          errorResponse.errors.push(`Missing property 'falseValue'.`);
        }

        break;

      case 'date':
        if (!parseConfig.fixedWidthFormat) {
          errorResponse.errors.push(`Missing property 'fixedWidthFormat'.`);
        }

        if (!parseConfig.jsonFormat) {
          errorResponse.errors.push(`Missing property 'jsonFormat'.`);
        }

        break;
    }

    if (errorResponse.errors.length > 0) {
      return errorResponse;
    }
  };
}
