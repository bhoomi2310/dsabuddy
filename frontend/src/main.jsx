import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/common'

fetch('/keywords.json')
  .then(response => response.json())
  .then(data => {
    const meta = document.createElement('meta');
    meta.name = 'keywords';
    meta.content = data.keywords.join(', ');
    document.head.appendChild(meta);
  })
  .catch(err => console.error('Failed to load keywords:', err));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
