type CardSectionLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const getCardSectionLayout = (
  width: number,
  height: number,
): CardSectionLayout => {
  const panelWidth = Math.min(1440, width - 48);
  const topInset = height < 500 ? 64 : 80;
  // REASON: the project strings hang from the viewport edge, so the panel
  // starts at the top and keeps the inset as ceiling space above its content.
  return {
    left: (width - panelWidth) / 2,
    top: 0,
    width: panelWidth,
    height: topInset + Math.min(760, height - topInset - 88),
  };
};
