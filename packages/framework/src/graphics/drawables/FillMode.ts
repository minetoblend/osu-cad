export enum FillMode {
  Stretch = 0,
  Fill = 1,
  Fit = 2,
}

export function fillModeToString(fillMode: FillMode) {
  switch (fillMode) {
    case FillMode.Fill:
      return 'Fill';
    case FillMode.Fit:
      return 'Fit';
    case FillMode.Stretch:
      return 'Stretch';
  }
}

const options: Record<string, FillMode> = {
  Fill: FillMode.Fill,
  Fit: FillMode.Fit,
  Stretch: FillMode.Stretch,
};

export function parseFillMode(fillMode: string) {
  if (!(fillMode in options))
    throw new Error(`Unknown fill mode ${fillMode}`);

  return options[fillMode];
}
