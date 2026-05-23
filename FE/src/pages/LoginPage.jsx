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

      toast.success('Đăng nhập thành công!')

      navigate('/')
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Đăng nhập thất bại'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <div className="
w-full
min-h-screen
grid
grid-cols-1
lg:grid-cols-[1.1fr_0.9fr]
overflow-hidden
bg-white
">
        
        {/* LEFT */}
        <div className="
relative
hidden
lg:flex
overflow-hidden
bg-gradient-to-br
from-[#f8efe5]
via-[#fdf8f3]
to-[#f5e7d7]
px-16
py-14
">
          
          <div className="relative z-10 flex flex-col justify-between">
            
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b5503a] shadow-lg">
                  <IconBook className="h-7 w-7 text-white" />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#8f7b68]">
                    Welcome to
                  </p>

                  <h1 className="text-2xl font-black tracking-tight text-[#3d2b1a]">
                    MangaStore
                  </h1>
                </div>
              </div>

              <h2 className="max-w-md text-5xl font-black leading-[1.1] tracking-tight text-[#3d2b1a]">
                Khám phá
                <span className="block text-[#b5503a]">
                  thế giới manga
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-[15px] leading-8 text-[#6b5744]">
                Hàng nghìn đầu truyện manga, manhwa và light novel chất lượng cao.
                Giao diện hiện đại, trải nghiệm đọc và mua truyện tốt nhất.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/50 bg-white/70 p-5 backdrop-blur-sm">
                <p className="text-3xl font-black text-[#b5503a]">
                  10k+
                </p>
                <p className="mt-1 text-sm text-[#7a6755]">
                  Đầu truyện
                </p>
              </div>

              <div className="rounded-2xl border border-white/50 bg-white/70 p-5 backdrop-blur-sm">
                <p className="text-3xl font-black text-[#5a7247]">
                  24/7
                </p>
                <p className="mt-1 text-sm text-[#7a6755]">
                  Cập nhật liên tục
                </p>
              </div>
            </div>
          </div>

          {/* DECOR */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#b5503a]/10 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[#5a7247]/10 blur-3xl" />
        </div>

        {/* RIGHT */}
        <div className="
flex
w-full
items-center
justify-center
px-6
py-10
sm:px-10
lg:px-16
xl:px-24
bg-white
">
          
          <div className="w-full max-w-md">
            
            {/* MOBILE LOGO */}
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#b5503a] to-[#8e3f2d] shadow-lg">
                <IconBook className="h-8 w-8 text-white" />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#3d2b1a]">
                MangaStore
              </h1>

              <p className="mt-2 text-sm text-[#8f7b68]">
                Đăng nhập để tiếp tục
              </p>
            </div>

            {/* HEADER */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#b5503a]">
                Welcome Back
              </p>

              <h2 className="text-4xl font-black tracking-tight text-[#3d2b1a]">
                Đăng nhập
              </h2>

              <p className="mt-3 text-[15px] leading-7 text-[#7a6755]">
                Tiếp tục hành trình khám phá thế giới truyện tranh của bạn.
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4d3b2b]">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  autoComplete="email"
                  id="login-email"
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-[#e5d9cb]
                    bg-[#fcfaf8]
                    px-4
                    text-[15px]
                    text-[#3d2b1a]
                    outline-none
                    transition-all
                    duration-300
                    placeholder:text-[#b0a08f]
                    focus:border-[#b5503a]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#b5503a]/10
                  "
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4d3b2b]">
                  Mật khẩu
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    id="login-password"
                    className="
                      h-14
                      w-full
                      rounded-2xl
                      border
                      border-[#e5d9cb]
                      bg-[#fcfaf8]
                      px-4
                      pr-16
                      text-[15px]
                      text-[#3d2b1a]
                      outline-none
                      transition-all
                      duration-300
                      placeholder:text-[#b0a08f]
                      focus:border-[#b5503a]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#b5503a]/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      font-bold
                      text-[#8f7b68]
                      transition-colors
                      hover:text-[#b5503a]
                    "
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              {/* REMEMBER */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-[#7a6755]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#d8cab9]"
                  />
                  Ghi nhớ đăng nhập
                </label>

                <button
                  type="button"
                  className="text-sm font-semibold text-[#b5503a] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                id="login-submit-btn"
                className="
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#b5503a]
                  text-[15px]
                  font-bold
                  text-white
                  shadow-lg
                  shadow-[#b5503a]/20
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#a34531]
                  hover:shadow-xl
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  'Đăng Nhập'
                )}
              </button>
            </form>

            {/* FOOTER */}
            <div className="mt-8 border-t border-[#eee4d8] pt-6 text-center">
              <p className="text-sm text-[#7a6755]">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  id="login-to-register-link"
                  className="font-bold text-[#b5503a] hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage