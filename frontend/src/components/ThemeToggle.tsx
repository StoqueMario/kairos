import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../store/theme'

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle glass-button"
      onClick={toggle}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      <span className={`theme-icon ${isDark ? 'is-dark' : 'is-light'}`}>
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  )
}
