import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import {
  getConfiguredGoogleClientId,
  isValidGoogleClientId,
  resolveGoogleClientIdFromServer
} from './googleAuthConfig'

const Root = () => {
  const [googleClientId, setGoogleClientId] = useState(getConfiguredGoogleClientId());

  useEffect(() => {
    let isActive = true;

    if (isValidGoogleClientId(googleClientId)) {
      return () => {
        isActive = false;
      };
    }

    resolveGoogleClientIdFromServer()
      .then((resolvedClientId) => {
        if (isActive && isValidGoogleClientId(resolvedClientId)) {
          setGoogleClientId(resolvedClientId);
        }
      })
      .catch(() => {
        // Keep app usable even when backend is unavailable.
      });

    return () => {
      isActive = false;
    };
  }, [googleClientId]);

  const appTree = useMemo(() => (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ), []);

  if (!isValidGoogleClientId(googleClientId)) {
    return appTree;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {appTree}
    </GoogleOAuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
