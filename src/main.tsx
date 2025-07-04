import { createRoot } from 'react-dom/client'
import App from './App.tsx'

console.log('main.tsx loading');

const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error("Root element not found");
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found</div>';
} else {
  console.log('Creating React root');
  try {
    const root = createRoot(rootElement);
    console.log('Rendering App');
    root.render(<App />);
    console.log('App rendered successfully');
  } catch (error) {
    console.error("Error rendering app:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Error loading app: ${error}</div>`;
  }
}