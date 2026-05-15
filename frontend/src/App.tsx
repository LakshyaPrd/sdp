import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/Landing'
import Dashboard from './pages/Dashboard'
import { SignUpPage, SignInPage } from './pages/Auth'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster position="top-right" theme="dark" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />
        <Route path="/signin/*" element={<SignInPage />} />
        <Route
          path="/dashboard/*"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <Navigate to="/signin" replace />
              </SignedOut>
            </>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
