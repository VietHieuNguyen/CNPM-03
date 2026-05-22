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
        <div className="w-12 h-12 border-4 border-manga-purple/30 border-t-manga-purple rounded-full animate-spin" />
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
        <div className="w-12 h-12 border-4 border-manga-purple/30 border-t-manga-purple rounded-full animate-spin" />
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
            <h2 className="text-2xl font-bold text-manga-text">Trang không tồn tại</h2>
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
              background: 'rgba(21, 2, 40, 0.95)',
              color: '#f0e6ff',
              border: '1px solid rgba(155, 45, 255, 0.3)',
              backdropFilter: 'blur(16px)',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: '600',
            },
            success: { iconTheme: { primary: '#9b2dff', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ff2d78', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
