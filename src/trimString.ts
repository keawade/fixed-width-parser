export const trimString = (
  stringToTrim: string,
  charToRemove: string,
  side: 'start' | 'end',
): string => {
  if (side === 'start') {
    while (stringToTrim.charAt(0) == charToRemove) {
      stringToTrim = stringToTrim.substring(1);
    }
  } else {
    while (stringToTrim.charAt(stringToTrim.length - 1) == charToRemove) {
      stringToTrim = stringToTrim.substring(0, stringToTrim.length - 1);
    }
  }

  return stringToTrim;
};
