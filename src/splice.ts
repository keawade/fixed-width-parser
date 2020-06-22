export const splice = (
  target: string,
  stringToInsert: string,
  positionToInsert: number
): string => {
  return target.slice(0, positionToInsert) + stringToInsert + target.slice(positionToInsert);
};
