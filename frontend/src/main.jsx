import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isValidGoogleClientId =
  Boolean(googleClientId) &&
  !googleClientId.startsWith('your_') &&
  googleClientId.endsWith('.apps.googleusercontent.com');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isValidGoogleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </StrictMode>,
)
