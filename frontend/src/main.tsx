import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

if (!PUBLISHABLE_KEY) {
  // Show a friendly message in the UI instead of a hard crash
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#09090b;color:#f4f4f5;font-family:sans-serif;text-align:center;padding:2rem;">
      <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:2.5rem;max-width:520px;width:100%;">
        <div style="font-size:2rem;margin-bottom:1rem;">⚠️</div>
        <h1 style="font-size:1.4rem;font-weight:700;margin-bottom:0.5rem;">Clerk Key Missing</h1>
        <p style="color:#a1a1aa;font-size:0.9rem;line-height:1.6;margin-bottom:1.5rem;">
          Please add your <strong style="color:#fff;">VITE_CLERK_PUBLISHABLE_KEY</strong> to 
          <code style="background:#27272a;padding:2px 6px;border-radius:4px;">.env.local</code>
        </p>
        <div style="background:#27272a;border-radius:10px;padding:1rem;text-align:left;font-family:monospace;font-size:0.82rem;color:#a1a1aa;">
          <span style="color:#6b7280;"># .env.local</span><br/>
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
        </div>
        <p style="color:#6b7280;font-size:0.78rem;margin-top:1.2rem;">
          Get your key at <a href="https://dashboard.clerk.com" style="color:#60a5fa;" target="_blank">dashboard.clerk.com</a> → Your App → API Keys
        </p>
      </div>
    </div>
  `
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </React.StrictMode>,
  )
}
