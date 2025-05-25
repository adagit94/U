export const genId = (() => {
  const NUMBER_CODE_POINT_RANGE = [48, 57];
  const UPPER_CASE_CODE_POINT_RANGE = [65, 90];
  const LOWER_CASE_CODE_POINT_RANGE = [97, 122];
  const CODE_POINT_RANGES = [NUMBER_CODE_POINT_RANGE, UPPER_CASE_CODE_POINT_RANGE, LOWER_CASE_CODE_POINT_RANGE];

  let codePoints: number[] = [];

  for (const [from, to] of CODE_POINT_RANGES) {
    for (let codePoint = from; codePoint <= to; codePoint++) {
      codePoints.push(codePoint);
    }
  }

  return (charsCount = 32) => {
    let str = "";

    for (let i = 0; i < charsCount; i++) {
      str += String.fromCodePoint(codePoints[Math.floor(codePoints.length * Math.random())]);
    }

    return str;
  };
})();
