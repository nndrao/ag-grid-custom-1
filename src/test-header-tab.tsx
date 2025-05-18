import React from 'react';
import ReactDOM from 'react-dom/client';
import { StandaloneHeaderTab } from './components/datatable/grid-settings/column-settings/demo/standalone-header-tab';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-50">
      <StandaloneHeaderTab />
    </div>
  </React.StrictMode>
);