import trimStart from 'lodash.trimstart';
import trimEnd from 'lodash.trimend';
import { ISegmentConfig, IDefaultableConfig } from '../interfaces/ISegmentConfig';

/**
 * Abstract base class for creating arbitrary processors
 */
export abstract class SegmentProcessor<T extends ISegmentConfig = ISegmentConfig> {
  public abstract type: T['type'];

  /**
   * Method to parse input
   *
   * @param input Trimmed input
   * @param config
   */
  public abstract parse(input: string, config: Required<T>): any;

  /**
   * Method to format input to fixed width string output
   *
   * @param input
   * @param config
   * @returns String output ready to be padded
   */
  public abstract format(input: { [key: string]: any }[], config: Required<T>): string;

  /**
   * Default configuration for segment processing
   */
  public defaultSegmentConfig: IDefaultableConfig = {
    padding: {
      character: ' ',
      direction: 'start',
      trim: true,
    },
  };

  /**
   * Method to trim raw input before parsing
   *
   * @param input
   * @param config
   * @returns Trimmed string
   */
  public trim(input: string, config: Required<T>): string {
    if (config.padding.trim === true) {
      if (config.padding.direction === 'start') {
        return trimStart(input, config.padding.character);
      }

      return trimEnd(input, config.padding.character);
    }

    return input;
  }

  /**
   * Method to pad output after formatting
   *
   * @param input
   * @param config
   * @returns Padded string
   */
  public pad(input: string, config: Required<T>): string {
    if (config.padding.direction === 'start') {
      return input.padStart(config.width, config.padding.character);
    }

    return input.padEnd(config.width, config.padding.character);
  }

  // TODO
  public validateConfig(config: Required<T>): boolean {
    // padding: {
    //   character: ' ',
    //   direction: 'start',
    //   trim: true,
    // },

    return true;
  }
}
