import { ISegmentConfig } from '../interfaces/ISegmentConfig';
import { SegmentProcessor } from './SegmentProcessor';
import { parse as parseToDate, isValid as isValidDate, format as formatDate } from 'date-fns';

export interface IDateSegmentConfig extends ISegmentConfig {
  type: 'date';
  fixedWidthFormat: string;
  jsonFormat: string;
}

export class DateSegmentProcessor extends SegmentProcessor<IDateSegmentConfig> {
  public type = 'date' as const;

  public parse(input: string, config: Required<IDateSegmentConfig>) {
    const parsedDate = parseToDate(input, config.fixedWidthFormat, new Date());

    if (isValidDate(parsedDate)) {
      return formatDate(parsedDate, config.jsonFormat);
    }

    // TODO: Falsy fallback? Not here though, think I want another processor method for it.
  }

  public format(input: { [key: string]: any }[], config: Required<IDateSegmentConfig>): string {
    const parsedDate = parseToDate(String(input[config.name]), config.jsonFormat, new Date());

    if (isValidDate(parsedDate)) {
      return formatDate(parsedDate, config.fixedWidthFormat);
    }
  }

  public validateConfig(config: Required<IDateSegmentConfig>): boolean {
    // TODO
    return super.validateConfig(config) && true;
  }
}
