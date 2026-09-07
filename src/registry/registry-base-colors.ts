export type BaseColor = {
  name:
    | 'red'
    | 'rose'
    | 'orange'
    | 'green'
    | 'blue'
    | 'cobalt'
    | 'yellow'
    | 'violet';
  label: string;
  primary: string;
  secondary: string;
};

export const DEFAULT_BASE_COLOR: BaseColor = {
  name: 'blue',
  label: 'Cyan & Ultraviolet',
  primary: '184 100% 65%',
  secondary: '260 100% 64%',
};

// REASON: each colourway has just two authored colours. UI contrast, mode
// variants, and 3D materials derive from this pair in the theme builders.
export const baseColors: BaseColor[] = [
  {
    name: 'red',
    label: 'Cherry & Ice',
    primary: '350 68% 51%',
    secondary: '202 64% 76%',
  },
  {
    name: 'rose',
    label: 'Rose & Sage',
    primary: '333 56% 54%',
    secondary: '153 28% 69%',
  },
  {
    name: 'orange',
    label: 'Persimmon & Ink',
    primary: '21 83% 55%',
    secondary: '231 38% 37%',
  },
  {
    name: 'green',
    label: 'Jade & Lilac',
    primary: '163 55% 40%',
    secondary: '274 48% 74%',
  },
  DEFAULT_BASE_COLOR,
  {
    name: 'cobalt',
    label: 'Cobalt & Lemon',
    primary: '226 80% 54%',
    secondary: '51 94% 68%',
  },
  {
    name: 'yellow',
    label: 'Citron & Iris',
    primary: '56 78% 58%',
    secondary: '252 43% 68%',
  },
  {
    name: 'violet',
    label: 'Violet & Mint',
    primary: '266 55% 57%',
    secondary: '166 43% 72%',
  },
];
