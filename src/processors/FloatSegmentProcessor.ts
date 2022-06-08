import { ISegmentConfig } from '../interfaces/ISegmentConfig';
import { splice } from '../splice';
import { SegmentProcessor } from './SegmentProcessor';

export interface IFloatSegmentConfig extends ISegmentConfig {
  type: 'float';
  decimalCount: number;
}

export class FloatSegmentProcessor extends SegmentProcessor<IFloatSegmentConfig> {
  public type = 'float' as const;

  public parse(input: string, config: Required<IFloatSegmentConfig>) {
    const decimalCount = config.decimalCount ?? 2;
    if (input.includes('.')) {
      return Number(input);
    }
    // Pad to original field width with 0's to ensure decimal can be injected
    const stringToParse = input.padStart(config.width, '0');
    return Number(splice(stringToParse, '.', stringToParse.length - 1 - decimalCount));

    // TODO: Falsy fallback? Not here though, think I want another processor method for it.
  }

  public format(input: { [key: string]: any }[], config: Required<IFloatSegmentConfig>): string {
    const numAsStr: string = input[config.name].toString();
    // If the value not longer contains a decimal point
    // (123.00 -> 123) assume the decimal point should be at the end.
    const decimalIndex = numAsStr.indexOf('.') > -1 ? numAsStr.indexOf('.') : numAsStr.length;

    let strippedDecimals = numAsStr.slice(0, decimalIndex + (config.decimalCount ?? 2) + 1);
    // Add expected decimal places
    const currentDecimals =
      strippedDecimals.indexOf('.') > -1
        ? strippedDecimals.slice(strippedDecimals.indexOf('.') + 1).length
        : 0;

    if (config.decimalCount > currentDecimals) {
      const decimalsNeeded = config.decimalCount - currentDecimals;
      strippedDecimals = strippedDecimals.padEnd(strippedDecimals.length + decimalsNeeded, '0');
    }

    return;
  }
}
