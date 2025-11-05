import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { PreferencesProvider } from './contexts/PreferencesContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { PageProvider } from './contexts/PageContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <NotificationProvider>
        <PageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PageProvider>
      </NotificationProvider>
    </PreferencesProvider>
  </StrictMode>,
)
