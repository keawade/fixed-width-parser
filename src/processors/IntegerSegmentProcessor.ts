import { ISegmentConfig } from '../interfaces/ISegmentConfig';
import { SegmentProcessor } from './SegmentProcessor';
import { StringSegmentProcessor } from './StringSegmentProcessor';

export interface IIntegerSegmentConfig extends ISegmentConfig {
  type: 'integer';
  mend?: 'floor' | 'ceil' | 'round' | 'error';
  radix?: number;
}

export class IntegerSegmentProcessor extends SegmentProcessor<IIntegerSegmentConfig> {
  public type = 'integer' as const;

  public parse(input: string, config: Required<IIntegerSegmentConfig>) {
    switch (config.mend) {
      case 'ceil':
        return Math.ceil(parseFloat(input));
      case 'round':
        return Math.round(parseFloat(input));
      case 'error':
        throw new Error(`Expected parsed value for '${config.name}' to be an integer`);
      case 'floor':
      default:
        return parseInt(input);
    }
  }

  public format(input: { [key: string]: any }[], config: Required<IIntegerSegmentConfig>): string {
    switch (config.mend) {
      case 'ceil':
        return Math.ceil(input[config.name]).toString(10);
      case 'round':
        return Math.round(input[config.name]).toString(10);
      case 'error':
        throw new Error(`Expected parsed value for '${config.name}' to be an integer`);
      case 'floor':
      default:
        return Math.floor(input[config.name]).toString(config.radix);
    }
  }

  public defaultSegmentConfig = {
    mend: 'round',
    radix: 10,
    padding: {
      character: '0',
      direction: 'start' as const,
      trim: true,
    },
  };
}
