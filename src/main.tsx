import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const THEME_STORAGE_KEY = 'brutnet-theme'

function applyInitialTheme() {
    if (typeof window === 'undefined') return

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    const theme = storedTheme === 'light' || storedTheme === 'dark'
        ? storedTheme
        : 'light'

    document.documentElement.setAttribute('data-theme', theme)
}

applyInitialTheme()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
