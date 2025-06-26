import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { DeviceVisibilityProvider } from './context/DeviceVisibilityContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DeviceVisibilityProvider>
      <App />
    </DeviceVisibilityProvider>
  </React.StrictMode>
);
