import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('ERROR: Root element (#root) not found in HTML!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: Root element not found</h1><p>Make sure index.html has &lt;div id="root"&gt;&lt;/div&gt;</p></div>';
} else {
  console.log('✓ Root element found');
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✓ React app rendered successfully');
  } catch (error) {
    console.error('ERROR rendering React app:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>Error Rendering App</h1><pre>${error.toString()}</pre></div>`;
  }
}
