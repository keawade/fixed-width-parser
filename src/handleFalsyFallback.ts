import { FalsyFallback } from './interfaces/IParseOptions';

export const handleFalsyFallback = (
  value: string | number | false,
  falsyFallback: FalsyFallback
): string | number | false | undefined | null => {
  if (!value && falsyFallback !== 'passthrough') {
    if (falsyFallback === 'undefined') {
      return undefined;
    }

    // Only option left is null
    return null;
  }

  if (typeof value === 'number' && Number.isNaN(value)) {
    return 0;
  }

  return value;
};
