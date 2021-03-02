export interface ICharacterWhitelist {
  /** Allow AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz */
  alpha?: boolean;
  /** Allow 1234567890 */
  numeric?: boolean;
  /** Allow ~ `!@#$%^&*()-_=+{}[]\|/?:;'"<>,. */
  special?: boolean;
  /** Allow characters beyond the Basic Latin Unicode block, such as control characters \u0000, emojis 😀, and other symbols ⍺ */
  extendedCharacters?: boolean;
  /** Allow each character in the given array. Each item should include only 1 character */
  other?: string[];
}
