// interface IParser {
//   type: string;
//   parse(input: string): { [key: string]: any };
//   format(input: { [key: string]: any }[]): string;
//   defaultSegmentConfig: IDefaultableConfig;
// }

export abstract class Parser<T extends ISegmentConfig = ISegmentConfig> {
  public abstract type: T['type'];
  public abstract parse(input: string, config: T): { [key: string]: any };
  public abstract format(input: { [key: string]: any }[], config: T): string;
  public abstract defaultSegmentConfig: IDefaultableConfig;
}

interface IDefaultableConfig {
  padChar: string;
}

interface IUniqueConfig {
  type: string;
  name: string;
  start: number;
  width: number;
}

type ILineConfig = ISegmentConfig[];
type ISegmentConfig = IUniqueConfig & Partial<IDefaultableConfig>;

interface IStringSegmentConfig extends ISegmentConfig {
  type: 'string';
}

class StringParser extends Parser<IStringSegmentConfig> {
  public type = 'string' as const;

  public parse(input: string, config: IStringSegmentConfig) {
    return { [config.name]: input };
  }

  public format(input: { [key: string]: any }[], config: IStringSegmentConfig): string {
    return `${input[config.name]}`;
  }

  public defaultSegmentConfig = {
    padChar: ' ',
  };
}

interface ISkipSegmentConfig extends ISegmentConfig {
  type: 'skip';
}

class SkipParser extends Parser<ISkipSegmentConfig> {
  public type = 'skip' as const;

  public parse() {
    return {};
  }

  public format(input: { [key: string]: any }[], config: ISkipSegmentConfig): string {
    return ''; // TODO: Maybe here? Probably in padding tooling
  }

  public defaultSegmentConfig = {
    padChar: ' ',
  };
}

export class FixedWidthParser {
  private parsers: Parser[] = [new StringParser(), new SkipParser()];
  private lineConfig: (IUniqueConfig & IDefaultableConfig)[];

  public constructor(lineConfig: ILineConfig) {
    this.lineConfig = this.applySegementConfigDefaults(lineConfig);
  }

  private applySegementConfigDefaults(
    lineConfig: ILineConfig,
  ): (IUniqueConfig & IDefaultableConfig)[] {
    return lineConfig.map((segmentConfig) => {
      const segmentParser = this.parsers.find((parser) => parser.type === segmentConfig.type);

      if (segmentParser === undefined) {
        throw new Error(
          `No parser for type '${segmentConfig.type}' found for segment name '${segmentConfig.name}'`,
        );
      }

      return {
        ...segmentParser.defaultSegmentConfig,
        ...segmentConfig,
      };
    });
  }

  // public use(parser: Parser): void {
  //   this.parsers.push(new parser());
  // }

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

  private parseLine(input: string): { [key: string]: any } {
    return {};
  }
}
