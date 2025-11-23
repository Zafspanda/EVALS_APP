import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.scss';
// Import SDS styles from linked package
import '@sendle/sds-ui/scss/sds.scss';

console.log('React main.tsx loading...');
console.log('React version:', React.version);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

const testElement = <div>Test React Element</div>;
console.log('Test element:', testElement);
console.log('Test element type:', typeof testElement);
console.log('Test element keys:', Object.keys(testElement));

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
