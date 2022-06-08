import { ISegmentConfig } from '../interfaces/ISegmentConfig';
import { SegmentProcessor } from './SegmentProcessor';

export interface IBooleanSegmentConfig extends ISegmentConfig {
  type: 'boolean';
  trueValue: string;
  falseValue: string;
}

export class BooleanSegmentProcessor extends SegmentProcessor<IBooleanSegmentConfig> {
  public type = 'boolean' as const;

  public parse(input: string, config: Required<IBooleanSegmentConfig>) {
    if (input === config.trueValue) {
      return true;
    }

    if (input === config.falseValue) {
      return false;
    }

    // TODO: Falsy fallback? Not here though, think I want another processor method for it.
  }

  public format(input: { [key: string]: any }[], config: Required<IBooleanSegmentConfig>): string {
    return input[config.name] ? config.trueValue : config.falseValue;
  }
}
