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
  private processors: Map<string, SegmentProcessor> = new Map();

  private lineConfig: (IUniqueConfig & IDefaultableConfig)[];

  public constructor(lineConfig: ILineConfig, customProcessors: SegmentProcessor[] = []) {
    this.processors.set('boolean', new BooleanSegmentProcessor());
    this.processors.set('date', new DateSegmentProcessor());
    this.processors.set('float', new FloatSegmentProcessor());
    this.processors.set('integer', new IntegerSegmentProcessor());
    this.processors.set('string', new StringSegmentProcessor());
    this.processors.set('skip', new SkipSegmentProcessor());

    customProcessors.forEach((customProcessor) =>
      this.processors.set(customProcessor.type, customProcessor),
    );

    // Validation
    lineConfig.map((config) => {
      const processor = this.processors.get(config.type);
      // TODO: handle errors
      processor.validateConfig();
    });

    this.lineConfig = this.applySegmentConfigDefaults(lineConfig);
  }

  private applySegmentConfigDefaults(
    lineConfig: ILineConfig,
  ): (IUniqueConfig & IDefaultableConfig)[] {
    return lineConfig.map((segmentConfig) => {
      const segmentParser = this.processors.get(segmentConfig.type);

      if (segmentParser === undefined) {
        throw new Error(
          `No parser for type '${segmentConfig.type}' found for segment name '${segmentConfig.name}'`,
        );
      }

      return merge({}, segmentParser.defaultSegmentConfig, segmentConfig);
    });
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
          [segmentWithConfig.segmentProcessorConfig.name]: this.parseLineSegment(
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
    const segmentProcessor = this.processors.get(segmentConfig.type);

    const trimmedInput = segmentProcessor.trim(input, segmentConfig);

    const output = segmentProcessor.parse(trimmedInput, segmentConfig);

    return output;
  }
}
