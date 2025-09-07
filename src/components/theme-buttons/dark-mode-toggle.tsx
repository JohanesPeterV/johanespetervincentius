import { useTheme } from 'next-themes';
import { Switch } from '../ui/switch';

export default function DarkModeToggle() {
  const { setTheme } = useTheme();
  return (
    <Switch
      onCheckedChange={(checked) => {
        setTheme(checked ? 'dark' : 'light');
      }}
    />
  );
}
