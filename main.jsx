import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App.jsx'
import { AuthProvider } from './src/contexts/AuthContext.jsx'
import { ThemeProvider } from './src/contexts/ThemeContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)


