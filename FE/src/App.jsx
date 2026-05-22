import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ComicDetailPage from './pages/ComicDetailPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-wabi-red/20 border-t-wabi-red rounded-full animate-spin" />
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

// Auth route (redirect if logged in)
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-wabi-red/20 border-t-wabi-red rounded-full animate-spin" />
      </div>
    )
  }
  return user ? <Navigate to="/" replace /> : children
}

const AppRoutes = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        <Route path="/comics/:slug" element={<ComicDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-96 gap-4">
            <div className="text-6xl">🗺️</div>
            <h2 className="text-2xl font-bold text-wabi-text font-serif">Trang không tồn tại</h2>
            <a href="/" className="btn-primary">Về Trang Chủ</a>
          </div>
        } />
      </Routes>
    </main>
    <Footer />
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#faf8f5',
              color: '#3d2b1a',
              border: '1px solid #d9cbb8',
              boxShadow: '0 4px 20px rgba(61, 43, 26, 0.12)',
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontWeight: '600',
            },
            success: { iconTheme: { primary: '#5a7247', secondary: '#fff' } },
            error: { iconTheme: { primary: '#b5503a', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
