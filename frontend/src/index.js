import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}