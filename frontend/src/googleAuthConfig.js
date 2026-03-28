const FALLBACK_API_BASE_URL = 'http://localhost:5001/api';
const GOOGLE_CLIENT_ID_CACHE_KEY = 'karyon_google_client_id';

export const isValidGoogleClientId = (clientId) => {
  const normalizedClientId = String(clientId || '').trim();
  return (
    Boolean(normalizedClientId) &&
    !normalizedClientId.startsWith('your_') &&
    normalizedClientId.endsWith('.apps.googleusercontent.com')
  );
};

export const getApiBaseUrl = () => {
  const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  return configuredBaseUrl || FALLBACK_API_BASE_URL;
};

export const getConfiguredGoogleClientId = () => {
  const envClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  if (isValidGoogleClientId(envClientId)) {
    return envClientId;
  }

  try {
    const cachedClientId = localStorage.getItem(GOOGLE_CLIENT_ID_CACHE_KEY) || '';
    if (isValidGoogleClientId(cachedClientId)) {
      return cachedClientId;
    }
  } catch (error) {
    // Ignore localStorage access errors in restricted contexts.
  }

  return '';
};

export const resolveGoogleClientIdFromServer = async () => {
  const endpoint = `${getApiBaseUrl()}/auth/google/config`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error('Unable to fetch Google auth configuration from server');
  }

  const data = await response.json();
  const serverClientId = String(data?.clientId || '').trim();
  const enabled = Boolean(data?.enabled) && isValidGoogleClientId(serverClientId);

  try {
    if (enabled) {
      localStorage.setItem(GOOGLE_CLIENT_ID_CACHE_KEY, serverClientId);
      return serverClientId;
    }

    localStorage.removeItem(GOOGLE_CLIENT_ID_CACHE_KEY);
  } catch (error) {
    // Ignore localStorage access errors in restricted contexts.
  }

  return '';
};
