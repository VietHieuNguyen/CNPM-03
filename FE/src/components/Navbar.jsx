import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconMenu, IconClose, IconLogout } from './Icons'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Helper to determine active link class
  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#FEFEFE]/95 backdrop-blur-md border-b border-[#d9cbb8] py-6 sm:py-8 shadow-sm transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between gap-4">
        {/* Logo (Just text, no icon) */}
        <Link to="/" className="flex items-center group flex-shrink-0">
          <span className="font-serif text-2xl font-bold text-[#3d2b1a] tracking-tight">
            Manga<span className="text-[#b5503a]">Store</span>
          </span>
        </Link>

        {/* Desktop Nav Links (Centered) */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link
            to="/"
            className={`text-sm font-bold transition-all relative py-1.5 ${
              isLinkActive('/') ? 'text-[#b5503a]' : 'text-[#6b5744] hover:text-[#b5503a]'
            }`}
          >
            Trang Chủ
            {isLinkActive('/') && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#b5503a] rounded-full animate-fade-in" />
            )}
          </Link>
          <Link
            to="/search"
            className={`text-sm font-bold transition-all relative py-1.5 ${
              location.pathname === '/search' && !location.search ? 'text-[#b5503a]' : 'text-[#6b5744] hover:text-[#b5503a]'
            }`}
          >
            Truyện
            {location.pathname === '/search' && !location.search && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#b5503a] rounded-full animate-fade-in" />
            )}
          </Link>
          <Link
            to="/search?sort=bestseller"
            className={`text-sm font-bold transition-all relative py-1.5 ${
              location.search.includes('sort=bestseller') ? 'text-[#b5503a]' : 'text-[#6b5744] hover:text-[#b5503a]'
            }`}
          >
            Bán Chạy
            {location.search.includes('sort=bestseller') && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#b5503a] rounded-full animate-fade-in" />
            )}
          </Link>
          <Link
            to="/search?sort=newest"
            className={`text-sm font-bold transition-all relative py-1.5 ${
              location.search.includes('sort=newest') ? 'text-[#5a7247]' : 'text-[#6b5744] hover:text-[#5a7247]'
            }`}
          >
            Mới Nhất
            {location.search.includes('sort=newest') && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#5a7247] rounded-full animate-fade-in" />
            )}
          </Link>
        </div>

        {/* Right side (Login / Register / Profile) */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-white border border-[#d9cbb8] px-3 py-1.5 rounded-xl hover:border-[#b5503a]/30 transition-all"
                id="navbar-profile-link"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5a7247] to-[#7d9b68] flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-[#3d2b1a] max-w-24 truncate">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-[#e8ddd1] hover:bg-red-50 text-[#6b5744] hover:text-[#b5503a] transition-all cursor-pointer"
                title="Đăng xuất"
                id="navbar-logout-btn"
              >
                <IconLogout className="w-[18px] h-[18px]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="border border-[#b5503a] text-[#b5503a] text-sm font-bold px-5 py-2.5 rounded-[10px] hover:bg-[#b5503a] hover:text-white transition-all duration-300"
                id="navbar-login-btn"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="bg-[#b5503a] text-white text-sm font-bold px-5 py-2.5 rounded-[10px] border border-[#b5503a] hover:bg-[#a0402b] hover:border-[#a0402b] transition-all duration-300"
                id="navbar-register-btn"
              >
                Đăng Ký
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl bg-[#e8ddd1] text-[#6b5744] cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="navbar-mobile-menu-btn"
          >
            {mobileOpen ? <IconClose className="w-[18px] h-[18px]" /> : <IconMenu className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-3 paper rounded-xl p-4 flex flex-col gap-3">
          <Link to="/" className="text-[#6b5744] font-semibold py-2 hover:text-[#b5503a]" onClick={() => setMobileOpen(false)}>Trang Chủ</Link>
          <Link to="/search" className="text-[#6b5744] font-semibold py-2 hover:text-[#b5503a]" onClick={() => setMobileOpen(false)}>Truyện</Link>
          <Link to="/search?sort=bestseller" className="text-[#6b5744] font-semibold py-2 hover:text-[#b5503a]" onClick={() => setMobileOpen(false)}>Bán Chạy</Link>
          <Link to="/search?sort=newest" className="text-[#6b5744] font-semibold py-2 hover:text-[#5a7247]" onClick={() => setMobileOpen(false)}>Mới Nhất</Link>
          {user ? (
            <>
              <Link to="/profile" className="text-[#6b5744] font-semibold py-2" onClick={() => setMobileOpen(false)}>Hồ Sơ: {user.name}</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="text-[#b5503a] font-semibold py-2 text-left cursor-pointer">Đăng Xuất</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="border border-[#b5503a] text-[#b5503a] flex-1 text-center text-sm font-bold py-1.5 rounded-lg" onClick={() => setMobileOpen(false)}>Đăng Nhập</Link>
              <Link to="/register" className="bg-[#b5503a] text-white flex-1 text-center text-sm font-bold py-1.5 rounded-lg" onClick={() => setMobileOpen(false)}>Đăng Ký</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
