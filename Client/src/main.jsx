import React from 'react';
import ReactDOM from 'react-dom/client';
import Chart from 'chart.js/auto';
try {
  window.Chart = Chart;
  console.debug('main.jsx: Chart available?', typeof window.Chart !== 'undefined');
  console.debug('main.jsx: Chart.version', window.Chart && window.Chart.version);
} catch (e) {
  console.debug('main.jsx: Failed to expose Chart', e.message);
}
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
