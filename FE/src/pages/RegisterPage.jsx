import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconBook } from '../components/Icons'
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
    if (!form.name || !form.email || !form.password) { toast.error('Vui lòng điền đầy đủ thông tin'); return }
    if (form.password.length < 6) { toast.error('Mật khẩu phải ít nhất 6 ký tự'); return }
    if (form.password !== form.confirm) { toast.error('Mật khẩu xác nhận không khớp'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-wabi-green to-wabi-green-light flex items-center justify-center shadow-warm-lg animate-float">
              <IconBook className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-wabi-text">MangaStore</h1>
          <p className="text-wabi-muted mt-2 text-sm">Tham gia cộng đồng truyện tranh</p>
        </div>

        <div className="paper-old p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-wabi-text mb-5 sm:mb-6 font-serif flex items-center gap-2">
            <svg className="w-4 h-4 text-wabi-green" viewBox="0 0 448 512" fill="currentColor"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32v144H48c-17.7 0-32 14.3-32 32s14.3 32 32 32h144v144c0 17.7 14.3 32 32 32s32-14.3 32-32V288h144c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
            Tạo Tài Khoản
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Tên hiển thị</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Tên của bạn" className="input-wabi" id="register-name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className="input-wabi" id="register-email" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" className="input-wabi pr-14" id="register-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-wabi-muted hover:text-wabi-red transition-colors cursor-pointer select-none">
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-wabi-secondary mb-1.5">Xác nhận mật khẩu</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="••••••••" className="input-wabi" id="register-confirm" />
            </div>
            <button type="submit" disabled={loading} className="btn-green w-full justify-center py-3 mt-2 disabled:opacity-60 cursor-pointer" id="register-submit-btn">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Đăng Ký Ngay'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-wabi-muted text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-wabi-red font-bold hover:underline" id="register-to-login-link">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
