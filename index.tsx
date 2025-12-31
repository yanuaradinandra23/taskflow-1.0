
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Polyfill for crypto.randomUUID ---
// This ensures the app works in non-secure contexts (HTTP) or older browsers
if (typeof crypto === 'undefined') {
  // @ts-ignore
  window.crypto = {};
}

if (!('randomUUID' in crypto)) {
  // @ts-ignore
  crypto.randomUUID = function randomUUID() {
    // Simple fallback using Math.random if crypto.getRandomValues is missing
    if (!('getRandomValues' in crypto)) {
       return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Better fallback using crypto.getRandomValues
    return (
      // @ts-ignore
      ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      )
    );
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
