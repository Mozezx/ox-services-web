import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import MyWorks from '../pages/MyWorks'
import WorkDetail from '../pages/WorkDetail'
import Upload from '../pages/Upload'
import Shop from '../pages/Shop'
import Cart from '../pages/Cart'
import MyOrders from '../pages/MyOrders'

const AppRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/works" element={<MyWorks />} />
      <Route path="/works/:id" element={<WorkDetail />} />
      <Route path="/works/:id/upload" element={<Upload />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<MyOrders />} />
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
