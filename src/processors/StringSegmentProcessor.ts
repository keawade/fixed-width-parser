import { ISegmentConfig } from '../interfaces/ISegmentConfig';
import { SegmentProcessor } from './SegmentProcessor';

export interface IStringSegmentConfig extends ISegmentConfig {
  type: 'string';
}

export class StringSegmentProcessor extends SegmentProcessor<IStringSegmentConfig> {
  public type = 'string' as const;

  public parse(input: string, config: Required<IStringSegmentConfig>) {
    return { [config.name]: input };
  }

  public format(input: { [key: string]: any }[], config: Required<IStringSegmentConfig>): string {
    return `${input[config.name]}`;
  }
}
