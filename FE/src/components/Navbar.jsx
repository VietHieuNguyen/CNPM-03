import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Search, LogOut, User, Menu, X } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`)
      setKeyword('')
      setSearchOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#f7f3ee]/95 backdrop-blur-md border-b border-wabi-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wabi-red to-wabi-brown flex items-center justify-center shadow-warm group-hover:scale-110 transition-transform">
            <BookOpen size={17} className="text-white" />
          </div>
          <span className="font-serif text-xl font-bold text-wabi-text hidden sm:block tracking-tight">
            Manga<span className="text-wabi-red">Store</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7 flex-1 justify-center">
          <Link to="/" className="text-wabi-secondary hover:text-wabi-red transition-colors text-sm font-semibold">Trang Chủ</Link>
          <Link to="/search" className="text-wabi-secondary hover:text-wabi-red transition-colors text-sm font-semibold">Truyện</Link>
          <Link to="/search?sort=bestseller" className="text-wabi-secondary hover:text-wabi-red transition-colors text-sm font-semibold">Bán Chạy</Link>
          <Link to="/search?sort=newest" className="text-wabi-secondary hover:text-wabi-green transition-colors text-sm font-semibold">Mới Nhất</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-xl bg-wabi-bg2 hover:bg-wabi-border text-wabi-secondary hover:text-wabi-red transition-all"
            id="navbar-search-btn"
          >
            <Search size={18} />
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="hidden sm:flex items-center gap-2 bg-white border border-wabi-border px-3 py-1.5 rounded-xl hover:border-wabi-red/30 transition-all" id="navbar-profile-link">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-wabi-green to-wabi-green-light flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-wabi-text max-w-24 truncate">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-wabi-bg2 hover:bg-red-50 text-wabi-secondary hover:text-wabi-red transition-all"
                title="Đăng xuất"
                id="navbar-logout-btn"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline text-sm px-4 py-1.5 hidden sm:flex" id="navbar-login-btn">Đăng Nhập</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-1.5" id="navbar-register-btn">Đăng Ký</Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-xl bg-wabi-bg2 text-wabi-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="navbar-mobile-menu-btn"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="max-w-7xl mx-auto mt-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm truyện, tác giả..."
              className="input-wabi flex-1"
              autoFocus
              id="navbar-search-input"
            />
            <button type="submit" className="btn-primary px-6" id="navbar-search-submit">
              <Search size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-3 paper rounded-xl p-4 flex flex-col gap-3">
          <Link to="/" className="text-wabi-secondary font-semibold py-2 hover:text-wabi-red" onClick={() => setMobileOpen(false)}>Trang Chủ</Link>
          <Link to="/search" className="text-wabi-secondary font-semibold py-2 hover:text-wabi-red" onClick={() => setMobileOpen(false)}>Truyện</Link>
          <Link to="/search?sort=bestseller" className="text-wabi-secondary font-semibold py-2 hover:text-wabi-red" onClick={() => setMobileOpen(false)}>Bán Chạy</Link>
          <Link to="/search?sort=newest" className="text-wabi-secondary font-semibold py-2 hover:text-wabi-green" onClick={() => setMobileOpen(false)}>Mới Nhất</Link>
          {user ? (
            <>
              <Link to="/profile" className="text-wabi-secondary font-semibold py-2" onClick={() => setMobileOpen(false)}>Hồ Sơ: {user.name}</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="text-wabi-red font-semibold py-2 text-left">Đăng Xuất</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-outline flex-1 justify-center text-sm" onClick={() => setMobileOpen(false)}>Đăng Nhập</Link>
              <Link to="/register" className="btn-primary flex-1 justify-center text-sm" onClick={() => setMobileOpen(false)}>Đăng Ký</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
