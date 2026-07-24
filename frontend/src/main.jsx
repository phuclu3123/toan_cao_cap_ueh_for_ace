import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/tokens.css'
import './assets/styles/theme.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
