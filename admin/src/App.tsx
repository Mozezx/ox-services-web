import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Works from '../pages/Works'
import WorkDetail from '../pages/WorkDetail'
import Timeline from '../pages/Timeline'
import Upload from '../pages/Upload'
import Appointments from '../pages/Appointments'

const AppRoutes = () => (
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
)

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppRoutes />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  )
}

export default App
