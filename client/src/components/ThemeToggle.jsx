import { Moon, Sun } from 'lucide-react';
import useThemeStore from '../store/themeStore';

export default function ThemeToggle() {
  const dark = useThemeStore((s) => s.dark);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <button
      className="btn-icon theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
