import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID ? 'Loaded ✅' : 'Missing ❌');

if (!GOOGLE_CLIENT_ID) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID is missing in .env file!');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);