import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Icon shown on the toggle button (depends on current theme)
  const CurrentIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  const options = [
    { value: 'light',  label: 'Light',  icon: Sun },
    { value: 'dark',   label: 'Dark',   icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        title="Change theme"
        className="p-2 rounded-lg text-gray-600 hover:text-gray-900
                   hover:bg-gray-100 transition
                   dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 py-2
                        bg-white border border-gray-200 rounded-lg shadow-xl z-[100]
                        dark:bg-black dark:border-white/10">
          {options.map((opt) => {
            const Icon = opt.icon
            const isActive = theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm
                           text-gray-700 hover:bg-gray-100 transition
                           dark:text-gray-300 dark:hover:bg-white/10"
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{opt.label}</span>
                {isActive && <Check className="w-4 h-4 text-blue-500" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ThemeToggle