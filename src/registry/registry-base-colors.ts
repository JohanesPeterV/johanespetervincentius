export type ThemeMode = 'light' | 'dark';

type ColorPair = {
  primary: string;
  secondary: string;
};

export type ThemePalette = ColorPair & {
  background: string;
  foreground: string;
  surface: string;
  muted: string;
  mutedForeground: string;
  border: string;
};

export type BaseColor = {
  name:
    | 'red'
    | 'rose'
    | 'orange'
    | 'green'
    | 'blue'
    | 'cobalt'
    | 'yellow'
    | 'violet'
    | 'catppuccin'
    | 'nord'
    | 'dracula'
    | 'tokyo-night'
    | 'one-dark'
    | 'rose-pine'
    | 'github'
    | 'night-owl'
    | 'solarized'
    | 'gruvbox';
  label: string;
} & (ColorPair | Record<ThemeMode, ThemePalette>);

export const DEFAULT_BASE_COLOR: BaseColor = {
  name: 'blue',
  label: 'Cyan & Ultraviolet',
  primary: '184 100% 65%',
  secondary: '260 100% 64%',
};

// REASON: colour pairs share neutral surfaces; full themes supply both modes.
// The same registry drives saved preferences, selection, UI, and 3D materials.
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
  {
    name: 'catppuccin',
    label: 'Catppuccin',
    dark: {
      primary: '267.407 83.505% 80.980%',
      secondary: '198.500 75.949% 69.020%',
      background: '240.000 21.053% 14.902%',
      foreground: '226.154 63.934% 88.039%',
      surface: '240.000 21.311% 11.961%',
      muted: '236.842 16.239% 22.941%',
      mutedForeground: '227.647 23.611% 71.765%',
      border: '234.286 13.208% 31.176%',
    },
    light: {
      primary: '266.044 85.047% 58.039%',
      secondary: '188.859 69.953% 41.765%',
      background: '220.000 23.077% 94.902%',
      foreground: '233.793 16.022% 35.490%',
      surface: '220.000 21.951% 91.961%',
      muted: '220.000 20.690% 88.627%',
      mutedForeground: '232.800 10.373% 47.255%',
      border: '226.667 12.162% 70.980%',
    },
  },
  {
    name: 'nord',
    label: 'Nord',
    dark: {
      primary: '193.333 43.373% 67.451%',
      secondary: '213.077 31.967% 52.157%',
      background: '220.000 16.364% 21.569%',
      foreground: '217.500 26.667% 94.118%',
      surface: '221.739 16.312% 27.647%',
      muted: '220.000 16.770% 31.569%',
      mutedForeground: '218.824 27.869% 88.039%',
      border: '220.000 16.484% 35.686%',
    },
    light: {
      primary: '213.077 31.967% 52.157%',
      secondary: '311.053 20.213% 63.137%',
      background: '217.500 26.667% 94.118%',
      foreground: '220.000 16.364% 21.569%',
      surface: '218.182 26.829% 91.961%',
      muted: '218.824 27.869% 88.039%',
      mutedForeground: '220.000 16.484% 35.686%',
      border: '213.103 25.664% 77.843%',
    },
  },
  {
    name: 'dracula',
    label: 'Dracula',
    dark: {
      primary: '264.706 89.474% 77.647%',
      secondary: '325.522 100.000% 73.725%',
      background: '231.429 14.894% 18.431%',
      foreground: '60.000 30.000% 96.078%',
      surface: '234.545 14.286% 15.098%',
      muted: '231.818 13.924% 30.980%',
      mutedForeground: '240.000 6.667% 76.471%',
      border: '225.455 26.613% 51.373%',
    },
    light: {
      primary: '252.283 54.043% 53.922%',
      secondary: '336.084 78.142% 35.882%',
      background: '48.000 100.000% 96.078%',
      foreground: '0.000 0.000% 12.157%',
      surface: '48.000 58.824% 93.333%',
      muted: '50.000 29.268% 83.922%',
      mutedForeground: '49.091 18.033% 35.882%',
      border: '240.000 18.519% 84.118%',
    },
  },
  {
    name: 'tokyo-night',
    label: 'Tokyo Night',
    dark: {
      primary: '220.800 88.652% 72.353%',
      secondary: '261.290 85.321% 78.627%',
      background: '235.000 18.750% 12.549%',
      foreground: '228.679 72.603% 85.686%',
      surface: '240.000 15.385% 10.196%',
      muted: '228.000 23.364% 20.980%',
      mutedForeground: '229.333 35.433% 75.098%',
      border: '229.231 23.077% 33.137%',
    },
    light: {
      primary: '214.652 80.952% 54.706%',
      secondary: '265.987 84.865% 63.725%',
      background: '230.000 11.111% 89.412%',
      foreground: '221.912 55.285% 48.235%',
      surface: '240.000 10.000% 92.157%',
      muted: '229.091 22.917% 81.176%',
      mutedForeground: '227.089 33.333% 53.529%',
      border: '231.667 23.684% 70.196%',
    },
  },
  {
    name: 'one-dark',
    label: 'One Dark',
    dark: {
      primary: '207.042 81.609% 65.882%',
      secondary: '286.337 59.763% 66.863%',
      background: '220.000 13.043% 18.039%',
      foreground: '219.000 13.514% 70.980%',
      surface: '216.000 13.158% 14.902%',
      muted: '217.500 13.115% 23.922%',
      mutedForeground: '219.130 13.295% 66.078%',
      border: '222.500 13.793% 34.118%',
    },
    light: {
      primary: '221.124 87.255% 60.000%',
      secondary: '300.938 62.745% 40.000%',
      background: '0.000 0.000% 98.039%',
      foreground: '228.000 8.197% 23.922%',
      surface: '0.000 0.000% 94.118%',
      muted: '240.000 1.961% 90.000%',
      mutedForeground: '227.143 6.250% 43.922%',
      border: '230.000 4.918% 76.078%',
    },
  },
  {
    name: 'rose-pine',
    label: 'Rosé Pine',
    dark: {
      primary: '2.449 55.056% 82.549%',
      secondary: '267.188 57.143% 78.039%',
      background: '249.231 22.034% 11.569%',
      foreground: '245.455 50.000% 91.373%',
      surface: '247.059 22.667% 14.706%',
      muted: '247.826 24.731% 18.235%',
      mutedForeground: '248.000 15.000% 60.784%',
      border: '247.500 13.187% 35.686%',
    },
    light: {
      primary: '2.697 52.663% 66.863%',
      secondary: '268.085 21.461% 57.059%',
      background: '32.308 56.522% 95.490%',
      foreground: '247.742 19.018% 31.961%',
      surface: '35.000 100.000% 97.647%',
      muted: '28.235 39.535% 91.569%',
      mutedForeground: '248.000 12.195% 51.765%',
      border: '315.000 3.922% 80.000%',
    },
  },
  {
    name: 'github',
    label: 'GitHub',
    dark: {
      primary: '211.976 100.000% 67.255%',
      secondary: '128.361 49.194% 48.627%',
      background: '216.000 27.778% 7.059%',
      foreground: '207.692 35.135% 92.745%',
      surface: '215.000 21.429% 10.980%',
      muted: '215.000 15.385% 15.294%',
      mutedForeground: '211.579 8.920% 58.235%',
      border: '212.308 11.927% 21.373%',
    },
    light: {
      primary: '212.440 92.070% 44.510%',
      secondary: '137.228 66.013% 30.000%',
      background: '0.000 0.000% 100.000%',
      foreground: '213.333 12.676% 13.922%',
      surface: '210.000 28.571% 97.255%',
      muted: '210.000 23.529% 93.333%',
      mutedForeground: '211.765 7.763% 42.941%',
      border: '210.000 17.500% 84.314%',
    },
  },
  {
    name: 'night-owl',
    label: 'Night Owl',
    dark: {
      primary: '220.800 100.000% 75.490%',
      secondary: '276.136 67.692% 74.510%',
      background: '206.842 95.000% 7.843%',
      foreground: '217.143 34.426% 88.039%',
      surface: '207.273 71.429% 15.098%',
      muted: '206.667 48.214% 21.961%',
      mutedForeground: '207.692 11.207% 54.510%',
      border: '206.786 22.764% 48.235%',
    },
    light: {
      primary: '220.563 63.393% 56.078%',
      secondary: '278.824 49.791% 53.137%',
      background: '0.000 0.000% 98.431%',
      foreground: '243.000 13.699% 28.627%',
      surface: '0.000 0.000% 94.118%',
      muted: '0.000 0.000% 87.843%',
      mutedForeground: '225.600 11.628% 42.157%',
      border: '223.200 13.812% 64.510%',
    },
  },
  {
    name: 'solarized',
    label: 'Solarized',
    dark: {
      primary: '204.767 69.355% 48.627%',
      secondary: '175.462 58.621% 39.804%',
      background: '192.222 100.000% 10.588%',
      foreground: '180.000 6.931% 60.392%',
      surface: '192.203 80.822% 14.314%',
      muted: '192.203 80.822% 14.314%',
      mutedForeground: '186.316 8.297% 55.098%',
      border: '194.483 14.146% 40.196%',
    },
    light: {
      primary: '204.767 69.355% 48.627%',
      secondary: '175.462 58.621% 39.804%',
      background: '43.846 86.667% 94.118%',
      foreground: '194.483 14.146% 40.196%',
      surface: '45.600 42.373% 88.431%',
      muted: '45.600 42.373% 88.431%',
      mutedForeground: '196.000 12.931% 45.490%',
      border: '180.000 6.931% 60.392%',
    },
  },
  {
    name: 'gruvbox',
    label: 'Gruvbox',
    dark: {
      primary: '41.970 95.305% 58.235%',
      secondary: '104.118 35.052% 61.961%',
      background: '0.000 0.000% 15.686%',
      foreground: '43.158 58.763% 80.980%',
      surface: '20.000 5.263% 22.353%',
      muted: '21.818 7.383% 29.216%',
      mutedForeground: '38.571 24.138% 65.882%',
      border: '26.667 9.677% 36.471%',
    },
    light: {
      primary: '36.522 80.100% 39.412%',
      secondary: '143.158 30.159% 37.059%',
      background: '48.462 86.667% 88.235%',
      foreground: '20.000 5.263% 22.353%',
      surface: '45.556 67.500% 84.314%',
      muted: '43.158 58.763% 80.980%',
      mutedForeground: '26.667 9.677% 36.471%',
      border: '38.571 24.138% 65.882%',
    },
  },
];
