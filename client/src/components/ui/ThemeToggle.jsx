/**
 * ThemeToggle.jsx — Sun / Moon toggle button
 */
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ size = 'md' }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className={`theme-toggle theme-toggle--${size}`}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
