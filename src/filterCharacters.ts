import { ICharacterWhitelist } from './interfaces/ICharacterWhitelist';

export function filterCharacters(
  rawString: string,
  characterWhitelist: ICharacterWhitelist = {},
): string {
  // If there is not a characterWhitelist, or all the properties are true, empty,
  // and/or undefined, return the original string
  if (
    (!characterWhitelist.other || characterWhitelist.other.join('').length === 0) &&
    characterWhitelist.special !== false &&
    characterWhitelist.alpha !== false &&
    characterWhitelist.numeric !== false &&
    characterWhitelist.extended !== false
  ) {
    return rawString;
  }

  let newString = rawString;
  const charactersToEscape = [
    '-',
    '/',
    '\\',
    '^',
    '$',
    '*',
    '+',
    '?',
    '.',
    '(',
    ')',
    '|',
    '[',
    ']',
    '{',
    '}',
  ];
  // Compile the 'other' characters into a string safe to add to a RegEx
  const otherWhitelist =
    characterWhitelist.other?.reduce(
      (final: string, value: string) =>
        charactersToEscape.includes(value) ? final + '\\' + value : final + value,
      '',
    ) || '';

  const characterStrings = {
    // This string identifies the characters to keep. If a character is
    // whitelisted in the 'other' property, then it should be added to this
    // string to preserve it in the output
    extended: '^ -~' + otherWhitelist,
    // The following strings identify the characters to remove. If a character
    // is whitelisted in the 'other' property, then it should be removed from
    // these strings to preserve it in the output
    numeric: '1234567890'.replace(new RegExp(`[${otherWhitelist}]*`, 'g'), ''),
    alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.replace(
      new RegExp(`[${otherWhitelist}]*`, 'g'),
      '',
    ),
  };

  for (const key in characterStrings) {
    if (characterWhitelist[key] === false) {
      newString = newString.replace(new RegExp(`[${characterStrings[key]}]`, 'g'), '');
    }
  }

  if (characterWhitelist.special === false) {
    const SPECIAL_CHARACTERS = [
      '-',
      '~',
      '`',
      '!',
      '@',
      '#',
      '$',
      '%',
      '^',
      '&',
      '*',
      '(',
      ')',
      '-',
      '_',
      '=',
      '+',
      '[',
      ']',
      '{',
      '}',
      '|',
      '\\',
      '/',
      ';',
      ':',
      "'",
      '"',
      ',',
      '.',
      '<',
      '>',
      '?',
      ' ',
    ];
    // Identify the special characters to remove.
    const specialChars: string | string[] = SPECIAL_CHARACTERS.filter(
      (char) => !characterWhitelist.other?.includes(char) || false,
    );
    const escapedSpecialChars = specialChars.reduce(
      (final: string, char: string) =>
        charactersToEscape.includes(char) ? final + '\\' + char : final + char,
      '',
    );
    newString = newString.replace(new RegExp(`[${escapedSpecialChars}]*`, 'gu'), '');
  }

  return newString;
}
