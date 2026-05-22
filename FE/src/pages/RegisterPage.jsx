import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    if (form.password.length < 6) {
      toast.error('Mật khẩu phải ít nhất 6 ký tự')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-wabi-green to-wabi-green-light flex items-center justify-center shadow-warm-lg animate-float">
              <BookOpen size={28} className="text-white" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-wabi-text">MangaStore</h1>
          <p className="text-wabi-muted mt-2 text-sm">Tham gia cộng đồng truyện tranh</p>
        </div>

        <div className="paper-old p-8">
          <h2 className="text-xl font-bold text-wabi-text mb-6 font-serif flex items-center gap-2">
            <span className="text-wabi-green">✦</span> Tạo Tài Khoản
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Tên hiển thị</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wabi-muted" />
                <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Tên của bạn" className="input-wabi pl-10" id="register-name" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wabi-muted" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className="input-wabi pl-10" id="register-email" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wabi-muted" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-wabi pl-10 pr-10"
                  id="register-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-wabi-muted hover:text-wabi-red transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wabi-muted" />
                <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="••••••••" className="input-wabi pl-10" id="register-confirm" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-green w-full justify-center py-3 mt-2 disabled:opacity-60" id="register-submit-btn">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Đăng Ký Ngay'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-wabi-muted text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-wabi-red font-bold hover:underline" id="register-to-login-link">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
