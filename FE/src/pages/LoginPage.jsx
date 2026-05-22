import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconBook } from '../components/Icons'
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
      await login(email, password)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-wabi-red to-wabi-brown flex items-center justify-center shadow-warm-lg animate-float">
              <IconBook className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-wabi-text">MangaStore</h1>
          <p className="text-wabi-muted mt-2 text-sm">Đăng nhập để khám phá kho truyện tranh</p>
        </div>

        <div className="paper-old p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-wabi-text mb-5 sm:mb-6 font-serif flex items-center gap-2">
            <svg className="w-4 h-4 text-wabi-red" viewBox="0 0 512 512" fill="currentColor"><path d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.4-33.9 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z"/></svg>
            Đăng Nhập
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="input-wabi" id="login-email" autoComplete="email" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-wabi pr-14" id="login-password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-wabi-muted hover:text-wabi-red transition-colors cursor-pointer select-none">
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer" id="login-submit-btn">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Đăng Nhập'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-wabi-muted text-sm">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-wabi-red font-bold hover:underline" id="login-to-register-link">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
