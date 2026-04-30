import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerDataSources } from './services/registerDataSources';
import App from './App';
import './index.css';

registerDataSources();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
