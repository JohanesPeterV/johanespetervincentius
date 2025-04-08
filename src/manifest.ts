import { MetadataRoute } from 'next';

interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
}

const getAppName = () => 'Johanes Peter Vincentius Portfolio';
const getShortName = () => 'Johanes Portfolio';
const getDescription = () =>
  'Interactive portfolio showcasing web development projects and skills';

const getAppColors = () => ({
  background: '#000000',
  theme: '#ffffff',
});

const getAppIcons = (): PWAIcon[] => [
  {
    src: '/favicon.ico',
    sizes: '64x64 32x32 24x24 16x16',
    type: 'image/x-icon',
  },
];

export default function manifest(): MetadataRoute.Manifest {
  const { background, theme } = getAppColors();

  return {
    name: getAppName(),
    short_name: getShortName(),
    description: getDescription(),
    start_url: '/',
    display: 'standalone',
    background_color: background,
    theme_color: theme,
    orientation: 'portrait-primary',
    icons: getAppIcons(),
  };
}
