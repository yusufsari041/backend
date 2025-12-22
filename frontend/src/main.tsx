import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import App from './App';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

const initCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });

    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapacitorApp.exitApp();
      } else {
        window.history.back();
      }
    });
  }
};

initCapacitor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

