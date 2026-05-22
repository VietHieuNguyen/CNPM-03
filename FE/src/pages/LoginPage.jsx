import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Decorative circles */}
      <div className="fixed top-20 left-10 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center animate-float glow-purple">
              <BookOpen size={28} className="text-white" />
            </div>
          </div>
          <h1 className="font-title text-2xl font-black gradient-text">MangaStore</h1>
          <p className="text-manga-muted mt-2 text-sm">Đăng nhập để khám phá kho truyện tranh</p>
        </div>

        {/* Form card */}
        <div className="glass p-8 rounded-2xl animate-border-glow">
          <h2 className="text-xl font-bold text-manga-text mb-6 flex items-center gap-2">
            <Sparkles size={20} className="text-manga-purple" />
            Đăng Nhập
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-manga-muted mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-manga-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anime@example.com"
                  className="input-anime pl-10"
                  id="login-email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-manga-muted mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-manga-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-anime pl-10 pr-10"
                  id="login-password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-manga-muted hover:text-manga-purple transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              id="login-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Đăng Nhập 🎌'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-manga-muted text-sm">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-manga-purple font-bold hover:text-manga-pink transition-colors" id="login-to-register-link">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
