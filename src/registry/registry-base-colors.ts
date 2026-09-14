export type ThemeMode = 'light' | 'dark';

export type ThemePalette = {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  surface: string;
  muted: string;
  mutedForeground: string;
  border: string;
};

export type BaseColor = {
  name:
    | 'catppuccin'
    | 'nord'
    | 'dracula'
    | 'tokyo-night'
    | 'one-dark'
    | 'rose-pine'
    | 'github'
    | 'night-owl'
    | 'solarized'
    | 'gruvbox'
    | 'ayu'
    | 'everforest'
    | 'kanagawa'
    | 'monokai-pro'
    | 'material'
    | 'vscode';
  label: string;
} & Record<ThemeMode, ThemePalette>;

// REASON: one registry supplies full light/dark palettes to preferences, UI,
// and 3D materials, so a theme always changes the entire scene.
export const baseColors: BaseColor[] = [
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
  {
    name: 'ayu',
    label: 'Ayu',
    dark: {
      primary: '40.000 75.000% 60.784%',
      secondary: '202.048 100.000% 67.451%',
      background: '220.000 27.273% 8.627%',
      foreground: '46.667 6.569% 73.137%',
      surface: '222.000 27.778% 7.059%',
      muted: '222.857 24.138% 11.373%',
      mutedForeground: '222.000 14.286% 41.176%',
      border: '222.857 20.588% 13.333%',
    },
    light: {
      primary: '34.954 89.344% 52.157%',
      secondary: '200.204 79.675% 51.765%',
      background: '0.000 0.000% 98.824%',
      foreground: '210.000 5.155% 38.039%',
      surface: '210.000 16.667% 97.647%',
      muted: '204.000 14.286% 93.137%',
      mutedForeground: '215.172 13.122% 56.667%',
      border: '204.000 14.286% 93.137%',
    },
  },
  {
    name: 'everforest',
    label: 'Everforest',
    dark: {
      primary: '83.438 33.684% 62.745%',
      secondary: '172.000 30.612% 61.569%',
      background: '205.714 13.462% 20.392%',
      foreground: '40.976 31.783% 74.706%',
      surface: '198.750 13.333% 23.529%',
      muted: '198.750 11.594% 27.059%',
      mutedForeground: '135.000 6.522% 63.922%',
      border: '204.000 8.671% 33.922%',
    },
    light: {
      primary: '67.500 98.765% 31.765%',
      secondary: '201.151 54.510% 50.000%',
      background: '43.846 86.667% 94.118%',
      foreground: '201.818 10.680% 40.392%',
      surface: '51.111 55.102% 90.392%',
      muted: '51.111 45.763% 88.431%',
      mutedForeground: '116.250 6.780% 53.725%',
      border: '78.000 14.286% 72.549%',
    },
  },
  {
    name: 'kanagawa',
    label: 'Kanagawa',
    dark: {
      primary: '220.000 53.571% 67.059%',
      secondary: '263.158 28.643% 60.980%',
      background: '240.000 12.676% 13.922%',
      foreground: '51.176 32.692% 79.608%',
      surface: '240.000 13.725% 10.000%',
      muted: '240.000 13.402% 19.020%',
      mutedForeground: '53.333 4.110% 42.941%',
      border: '240.000 12.953% 37.843%',
    },
    light: {
      primary: '218.462 33.621% 45.490%',
      secondary: '264.000 26.570% 40.588%',
      background: '53.333 67.500% 84.314%',
      foreground: '240.000 8.696% 36.078%',
      surface: '50.943 50.476% 79.412%',
      muted: '51.250 40.678% 76.863%',
      mutedForeground: '48.750 7.619% 41.176%',
      border: '225.000 8.000% 80.392%',
    },
  },
  {
    name: 'monokai-pro',
    label: 'Monokai Pro',
    dark: {
      primary: '345.190 100.000% 69.020%',
      secondary: '90.000 59.302% 66.275%',
      background: '285.000 4.545% 17.255%',
      foreground: '60.000 25.000% 98.431%',
      surface: '300.000 4.615% 12.745%',
      muted: '280.000 2.362% 24.902%',
      mutedForeground: '0.000 0.800% 75.490%',
      border: '280.000 1.657% 35.490%',
    },
    light: {
      primary: '342.078 71.963% 58.039%',
      secondary: '153.782 61.026% 38.235%',
      background: '15.000 44.444% 96.471%',
      foreground: '290.000 7.692% 15.294%',
      surface: '15.000 18.182% 91.373%',
      muted: '8.571 7.368% 81.373%',
      mutedForeground: '324.000 2.283% 42.941%',
      border: '350.000 4.478% 73.725%',
    },
  },
  {
    name: 'material',
    label: 'Material',
    dark: {
      primary: '174.400 41.899% 64.902%',
      secondary: '84.396 66.423% 73.137%',
      background: '193.636 22.917% 18.824%',
      foreground: '200.000 15.328% 73.137%',
      surface: '192.000 26.316% 14.902%',
      muted: '190.000 19.672% 23.922%',
      mutedForeground: '198.367 23.005% 58.235%',
      border: '193.714 24.823% 27.647%',
    },
    light: {
      primary: '186.792 100.000% 41.569%',
      secondary: '84.632 40.084% 53.529%',
      background: '0.000 0.000% 98.039%',
      foreground: '198.947 18.447% 40.392%',
      surface: '0.000 0.000% 100.000%',
      muted: '240.000 2.128% 90.784%',
      mutedForeground: '199.286 15.054% 63.529%',
      border: '200.000 31.343% 86.863%',
    },
  },
  {
    name: 'vscode',
    label: 'VS Code',
    dark: {
      primary: '206.038 100.000% 41.569%',
      secondary: '167.805 53.247% 54.706%',
      background: '0.000 0.000% 12.157%',
      foreground: '0.000 0.000% 80.000%',
      surface: '0.000 0.000% 9.412%',
      muted: '0.000 0.000% 16.863%',
      mutedForeground: '0.000 0.000% 61.569%',
      border: '0.000 0.000% 23.529%',
    },
    light: {
      primary: '209.022 100.000% 36.078%',
      secondary: '193.565 60.209% 37.451%',
      background: '0.000 0.000% 100.000%',
      foreground: '0.000 0.000% 23.137%',
      surface: '0.000 0.000% 97.255%',
      muted: '0.000 0.000% 89.804%',
      mutedForeground: '0.000 0.000% 38.039%',
      border: '0.000 0.000% 80.784%',
    },
  },
];

export const DEFAULT_BASE_COLOR = baseColors[0];
