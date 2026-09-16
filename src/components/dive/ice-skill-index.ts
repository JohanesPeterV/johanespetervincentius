export const iceSkillIndex = (progress: number, groupCount: number): number => {
  if (groupCount <= 1 || (progress >= 0.35 && progress <= 0.65)) {
    return 0;
  }
  const before = Math.floor((groupCount - 1) / 2);
  if (progress < 0.35) {
    return (
      1 +
      Math.min(before - 1, Math.floor((Math.max(0, progress) / 0.35) * before))
    );
  }
  const after = groupCount - 1 - before;
  return (
    1 +
    before +
    Math.min(after - 1, Math.floor(((progress - 0.65) / 0.35) * after))
  );
};
