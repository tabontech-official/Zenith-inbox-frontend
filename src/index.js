import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { installAxiosInterceptors } from './utils/apiClient';

/*
 * Installs the global Authorization header on every axios request.
 * Must run before any component issues a request.
 */
installAxiosInterceptors();

// Intercept & silence cross-origin third-party widget script errors (e.g. Tawk.to / external widgets)
window.addEventListener('error', (event) => {
  if (event?.message && (event.message.includes('Script error') || event.message.includes('BufferLoader'))) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    return true;
  }
}, true);

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '699764666952-8fqvv5qdrr58om165o4tf9lksbno97im.apps.googleusercontent.com';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);


reportWebVitals();
