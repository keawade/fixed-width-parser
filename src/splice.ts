export const splice = (
  target: string,
  stringToInsert: string,
  positionToInsert: number,
): string => {
  return (
    target.slice(0, positionToInsert + 1) + stringToInsert + target.slice(positionToInsert + 1)
  );
};
