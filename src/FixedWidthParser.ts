import merge from 'lodash.merge';
import { ILineConfig } from './interfaces/ILineConfig';
import { ISegmentConfig, IUniqueConfig, IDefaultableConfig } from './interfaces/ISegmentConfig';
import { IntegerSegmentProcessor } from './processors';
import { BooleanSegmentProcessor } from './processors/BooleanSegmentProcessor';
import { DateSegmentProcessor } from './processors/DateSegmentProcessor';
import { FloatSegmentProcessor } from './processors/FloatSegmentProcessor';
import { SegmentProcessor } from './processors/SegmentProcessor';
import { SkipSegmentProcessor } from './processors/SkipSegmentProcessor';
import { StringSegmentProcessor } from './processors/StringSegmentProcessor';

export class FixedWidthParser {
  // TODO: Find a better way to do this?
  private processors: SegmentProcessor[] = [
    new BooleanSegmentProcessor(),
    new DateSegmentProcessor(),
    new FloatSegmentProcessor(),
    new IntegerSegmentProcessor(),
    new StringSegmentProcessor(),
    new SkipSegmentProcessor(),
  ];
  private lineConfig: (IUniqueConfig & IDefaultableConfig)[];

  // TODO: Could be better to set custom processors on construction rather than after with `.use()`
  public constructor(lineConfig: ILineConfig) {
    this.lineConfig = this.applySegmentConfigDefaults(lineConfig);
  }

  private applySegmentConfigDefaults(
    lineConfig: ILineConfig,
  ): (IUniqueConfig & IDefaultableConfig)[] {
    return lineConfig.map((segmentConfig) => {
      const segmentParser = this.processors.find((parser) => parser.type === segmentConfig.type);

      if (segmentParser === undefined) {
        throw new Error(
          `No parser for type '${segmentConfig.type}' found for segment name '${segmentConfig.name}'`,
        );
      }

      return merge({}, segmentParser.defaultSegmentConfig, segmentConfig);
    });
  }

  public use(processor: SegmentProcessor): void {
    this.processors.push(processor);
  }

  public parse(input: string): { [key: string]: any }[] {
    if (!input) {
      throw new Error('Invalid input! Input is empty!');
    }

    if (typeof input !== 'string') {
      throw new Error(`Invalid input! Input must be a string!`);
    }

    const lines = input.replace(/\r\n/g, '\n').split('\n');

    return lines.map((line) => this.parseLine(line));
  }

  private parseLine(line: string): { [key: string]: any } {
    return this.lineConfig
      .map((segmentProcessorConfig) => ({
        segmentProcessorConfig,
        segment: line.slice(
          segmentProcessorConfig.start,
          segmentProcessorConfig.start + segmentProcessorConfig.width,
        ),
      }))
      .reduce(
        (accumulator, segmentWithConfig) => ({
          ...accumulator,
          ...this.parseLineSegment(
            segmentWithConfig.segment,
            segmentWithConfig.segmentProcessorConfig,
          ),
        }),
        {} as { [key: string]: any },
      );
  }

  private parseLineSegment(
    input: string,
    segmentConfig: Required<ISegmentConfig>,
  ): { [key: string]: any } {
    // Find our parser
    const segmentParser = this.processors.find((parser) => parser.type === segmentConfig.type);

    const trimmedInput = segmentParser.trim(input, segmentConfig);

    const output = segmentParser.parse(trimmedInput, segmentConfig);

    return output;
  }
}
