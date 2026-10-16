import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/app/App.jsx'
import { AuthProvider } from '@/modules/auth/AuthContext.jsx';
import { ToastProvider } from '@/shared/ui/Toast.jsx';
import { initEffects } from '@/shared/config/effects';

initEffects();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
