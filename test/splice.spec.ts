import { splice } from '../src/splice';

describe('splice', () => {
  it('should splice a string into another string', () => {
    const target = '123567';
    const payload = '4';
    const expected = '1234567';

    const actual = splice(target, payload, 2);

    expect(actual).toBe(expected);
  });
});
