import { ISegmentConfig } from '../interfaces/ISegmentConfig';
import { SegmentProcessor } from './SegmentProcessor';

interface ISkipSegmentConfig extends ISegmentConfig {
  type: 'skip';
}

export class SkipSegmentProcessor extends SegmentProcessor<ISkipSegmentConfig> {
  public type = 'skip' as const;

  public parse() {
    return {};
  }

  public format(): string {
    return '';
  }
}
