import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { DbProvider } from './DbContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DbProvider>
      <App />
    </DbProvider>
  </StrictMode>,
)
