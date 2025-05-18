import React from 'react';
import ReactDOM from 'react-dom/client';
import { VerifyIntegration } from './components/datatable/grid-settings/column-settings/demo/verify-integration';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-white">
      <VerifyIntegration />
    </div>
  </React.StrictMode>
);