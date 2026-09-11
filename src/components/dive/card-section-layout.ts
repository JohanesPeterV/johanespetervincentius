type CardSectionLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
};

// REASON: the panel spans the full height so each card chapter can centre
// itself between the appearance controls and the chapter navigation.
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
