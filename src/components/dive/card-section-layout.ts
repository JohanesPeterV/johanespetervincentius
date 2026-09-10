type CardSectionLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
};

// REASON: the project strings hang from the viewport edge and the work cards
// rest above the chapter navigation, so the panel spans the full height and
// any spare room opens up between the two.
export const getCardSectionLayout = (
  width: number,
  height: number,
): CardSectionLayout => {
  const panelWidth = Math.min(1440, width - 48);
  return {
    left: (width - panelWidth) / 2,
    top: 0,
    width: panelWidth,
    height: height - 88,
  };
};
