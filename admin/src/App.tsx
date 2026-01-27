import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Dashboard from '../pages/Dashboard'
import Works from '../pages/Works'
import WorkDetail from '../pages/WorkDetail'
import Timeline from '../pages/Timeline'
import Upload from '../pages/Upload'
import Appointments from '../pages/Appointments'

function App() {
  return (
    <div className="App">
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
          <div className="max-w-md w-full text-center card">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">Admin OX Services</h1>
              <p className="text-text-light">Painel administrativo para gerenciamento de obras</p>
            </div>
            <div className="space-y-4">
              <SignInButton mode="modal">
                <button className="btn btn-primary w-full">
                  <span className="material-symbols-outlined">login</span>
                  Entrar com Clerk
                </button>
              </SignInButton>
              <p className="text-sm text-text-light">
                Use suas credenciais Clerk para acessar o painel administrativo
              </p>
            </div>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/works" element={<Works />} />
            <Route path="/works/:id" element={<WorkDetail />} />
            <Route path="/works/:id/timeline" element={<Timeline />} />
            <Route path="/works/:id/upload" element={<Upload />} />
          </Routes>
        </Layout>
      </SignedIn>
    </div>
  )
}

export default App