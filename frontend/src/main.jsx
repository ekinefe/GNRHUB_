import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import './index.css'
import App from '@/app/App.jsx'
import { AuthProvider } from '@/modules/auth/AuthContext.jsx';
import { ToastProvider } from '@/shared/ui/Toast.jsx';
import { initEffects } from '@/shared/config/effects';
import { initTheme } from '@/shared/config/theme';

initEffects();
initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
