type WorkLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const getWorkLayout = (width: number, height: number): WorkLayout => {
  const panelWidth = Math.min(1440, width - 48);
  const topInset = height < 500 ? 64 : 80;
  const bottomInset = height < 500 ? 72 : 88;
  const availableHeight = height - topInset - bottomInset;
  const panelHeight = Math.min(760, availableHeight);
  return {
    left: (width - panelWidth) / 2,
    top: topInset + (availableHeight - panelHeight) / 2,
    width: panelWidth,
    height: panelHeight,
  };
};
