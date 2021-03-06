import { filterCharacters } from '../src/filterCharacters';
import { ICharacterWhitelist } from '../src/interfaces/ICharacterWhitelist';

describe('filterCharacters', () => {
  const rawString = '⍺Abc☆09⌋🕷8.!!?()💩 \u00000123ヶ丘２丁�~`!@#$%^&*()-_=+{}[]|/\\?:;\'"<>,.';

  test.each([
    { special: true },
    { numeric: true },
    { alpha: true },
    { extended: true },
    { other: [''] },
    {},
    undefined,
  ])('should return the same string for %p', (whitelist: ICharacterWhitelist) => {
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual(rawString);
  });

  it('should return a string with no digits', () => {
    const whitelist: ICharacterWhitelist = { numeric: false };
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual('⍺Abc☆⌋🕷.!!?()💩 \u0000ヶ丘２丁�~`!@#$%^&*()-_=+{}[]|/\\?:;\'"<>,.');
  });

  it('should return a string with no special characters', () => {
    const whitelist: ICharacterWhitelist = { special: false };
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual('⍺Abc☆09⌋🕷8💩\u00000123ヶ丘２丁�');
  });

  it('should return a string with no alphabetic characters', () => {
    const whitelist: ICharacterWhitelist = { alpha: false };
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual('⍺☆09⌋🕷8.!!?()💩 \u00000123ヶ丘２丁�~`!@#$%^&*()-_=+{}[]|/\\?:;\'"<>,.');
  });

  it('should return a string with no digits except 0', () => {
    const whitelist: ICharacterWhitelist = { numeric: false, other: ['0'] };
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual('⍺Abc☆0⌋🕷.!!?()💩 \u00000ヶ丘２丁�~`!@#$%^&*()-_=+{}[]|/\\?:;\'"<>,.');
  });

  it('should return a string with no digits except 0 and 9', () => {
    const whitelist: ICharacterWhitelist = { numeric: false, other: ['0', '9'] };
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual('⍺Abc☆09⌋🕷.!!?()💩 \u00000ヶ丘２丁�~`!@#$%^&*()-_=+{}[]|/\\?:;\'"<>,.');
  });

  it('should return a string with no special characters except a "?"', () => {
    const whitelist: ICharacterWhitelist = { special: false, other: ['?'] };
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual('⍺Abc☆09⌋🕷8?💩\u00000123ヶ丘２丁�?');
  });

  it('should return a string with no alphabetic characters except "A"', () => {
    const whitelist: ICharacterWhitelist = { alpha: false, other: ['A'] };
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual(
      '⍺A☆09⌋🕷8.!!?()💩 \u00000123ヶ丘２丁�~`!@#$%^&*()-_=+{}[]|/\\?:;\'"<>,.',
    );
  });

  it('should return a string with only the "other" characters', () => {
    const whitelist: ICharacterWhitelist = {
      alpha: false,
      numeric: false,
      special: false,
      extended: false,
      other: [':', ';', '.', '*', ']', '('],
    };
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual('.(*(]:;.');
  });

  it('should return an empty string', () => {
    const whitelist: ICharacterWhitelist = {
      alpha: false,
      numeric: false,
      special: false,
      extended: false,
    };
    const actual = filterCharacters(rawString, whitelist);
    expect(actual).toEqual('');
  });

  it('should remove emojis and control and unicode characters', () => {
    const testString = `⍺Abc☆09⌋🕷8.!!?(\u0000)  \0\f␇💩`;
    const actual = filterCharacters(testString, { extended: false });
    expect(actual).toEqual('Abc098.!!?()');
  });

  it('should keep emojis and unicode characters', () => {
    const testString = `⍺Abc☆09⌋🕷8.!!?()💩`;
    const actual = filterCharacters(testString, { other: ['💩', '☆⍺', '⌋🕷'] });
    expect(actual).toEqual(testString);
  });

  it('should keep control characters', () => {
    const testString = `⍺Abc098.!!?(\u0000)  💩`;
    const actual = filterCharacters(testString, {
      extended: false,
      other: ['\u0000', ' '],
    });
    expect(actual).toEqual(`Abc098.!!?(\u0000)  `);
  });

  it('should remove numeric and special characters', () => {
    const testString =
      'INFO] :谷���新道, ひば���ヶ丘2２丁���, ひばりヶ���, 東久留米市 (Higashikurume)';
    const whitelist: ICharacterWhitelist = {
      numeric: false,
      special: false,
      extended: true,
      other: [' '],
    };
    const actual = filterCharacters(testString, whitelist);
    expect(actual).toEqual(
      'INFO 谷���新道 ひば���ヶ丘２丁��� ひばりヶ��� 東久留米市 Higashikurume',
    );
  });

  it('should return numeric, non-ascii and special characters', () => {
    const testString =
      'INFO] :谷���新道, ひば���ヶ丘2２丁���, ひばりヶ���, 東久留米市 (Higashikurume)';
    const whitelist: ICharacterWhitelist = { alpha: false };
    const actual = filterCharacters(testString, whitelist);
    expect(actual).toEqual('] :谷���新道, ひば���ヶ丘2２丁���, ひばりヶ���, 東久留米市 ()');
  });
});
