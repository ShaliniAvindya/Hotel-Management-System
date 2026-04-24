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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

try {
  // Clear previously persisted caches once for security.
  localStorage.removeItem('hotel-management-query-cache');
  Object.keys(localStorage)
    .filter((key) => key.endsWith('_v1') || key === 'analytics_snapshot_v1')
    .forEach((key) => localStorage.removeItem(key));
} catch (e) {
  console.warn('Failed to clear old local cache entries', e);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
