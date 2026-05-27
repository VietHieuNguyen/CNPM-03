import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Search, Menu, X, BookOpen, Compass, ClipboardList, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?keyword=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container container">
        {/* Mobile Menu Trigger */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          Komorebi Manga
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <NavLink to="/collection" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Bộ sưu tập
          </NavLink>
          <NavLink to="/collection?sort=newest" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Mới về
          </NavLink>
          <NavLink to="/collection?sort=bestseller" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Tác giả
          </NavLink>
          <NavLink to="/collection?category=manga" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Góc đọc
          </NavLink>
        </nav>

        {/* Toolbar Icons */}
        <div className="navbar-toolbar">
          {/* Search Trigger */}
          <div className="search-wrapper">
            <button className="toolbar-btn" onClick={() => setSearchOpen(!searchOpen)} title="Tìm kiếm">
              <Search size={20} />
            </button>
            
            {searchOpen && (
              <form onSubmit={handleSearchSubmit} className="navbar-search-form">
                <input
                  type="text"
                  placeholder="Tìm truyện, tác giả, thể loại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="search-submit-btn">
                  <Search size={16} />
                </button>
              </form>
            )}
          </div>

          {/* Cart Link */}
          <Link to="/cart" className="toolbar-btn cart-btn" title="Giỏ hàng">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </Link>

          {/* User Profile / Login */}
          <div className="profile-menu-container">
            {user ? (
              <>
                <button className="toolbar-btn profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                  ) : (
                    <User size={20} />
                  )}
                </button>
                {showProfileMenu && (
                  <div className="profile-dropdown animate-fade-in">
                    <div className="dropdown-header">
                      <p className="user-name">{user.name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <hr className="dropdown-divider" />
                    {user.role === "admin" && (
                      <Link to="/admin" className="dropdown-item text-accent" style={{ fontWeight: "600", color: "var(--color-accent)" }} onClick={() => setShowProfileMenu(false)}>
                        <Compass size={16} /> Trang quản trị
                      </Link>
                    )}
                     <Link to="/profile?tab=edit-profile" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                       <User size={16} /> Thông tin cá nhân
                     </Link>
                     <Link to="/profile?tab=orders" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                       <ClipboardList size={16} /> Đơn hàng của tôi
                     </Link>
                     <Link to="/profile?tab=addresses" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                       <MapPin size={16} /> Sổ địa chỉ
                     </Link>
                    <button className="dropdown-item logout-btn" onClick={() => { setShowProfileMenu(false); handleLogout(); }}>
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="toolbar-btn" title="Đăng nhập">
                <User size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer animate-fade-in">
          <nav className="mobile-nav-links">
            <Link to="/collection" onClick={() => setMobileMenuOpen(false)}>Bộ sưu tập</Link>
            <Link to="/collection?sort=newest" onClick={() => setMobileMenuOpen(false)}>Mới về</Link>
            <Link to="/collection?sort=bestseller" onClick={() => setMobileMenuOpen(false)}>Tác giả</Link>
            <Link to="/collection?category=manga" onClick={() => setMobileMenuOpen(false)}>Góc đọc</Link>
             {user ? (
              <>
                <hr style={{ borderColor: "var(--border-color)", margin: "16px 0" }} />
                {user.role === "admin" && (
                  <Link to="/admin" style={{ color: "var(--color-accent)", fontWeight: "600" }} onClick={() => setMobileMenuOpen(false)}>Trang quản trị</Link>
                )}
                <Link to="/profile?tab=edit-profile" onClick={() => setMobileMenuOpen(false)}>Thông tin cá nhân</Link>
                <Link to="/profile?tab=orders" onClick={() => setMobileMenuOpen(false)}>Đơn hàng của tôi</Link>
                <Link to="/profile?tab=addresses" onClick={() => setMobileMenuOpen(false)}>Sổ địa chỉ</Link>
                <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="mobile-logout-btn">
                  Đăng xuất ({user.name})
                </button>
              </>
            ) : (
              <>
                <hr style={{ borderColor: "var(--border-color)", margin: "16px 0" }} />
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Đăng nhập / Đăng ký</Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Custom Styles for Navbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .navbar-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
        }
        .brand-logo {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-accent);
          letter-spacing: -0.02em;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 36px;
        }
        .nav-link {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-text-muted);
          position: relative;
          padding: 8px 0;
        }
        .nav-link:hover {
          color: var(--color-text-main);
        }
        .nav-link.active {
          color: var(--color-accent);
          font-weight: 600;
        }
        .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--color-accent);
        }
        .navbar-toolbar {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .toolbar-btn {
          color: var(--color-text-main);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: var(--transition);
        }
        .toolbar-btn:hover {
          background-color: var(--bg-secondary);
          color: var(--color-accent);
        }
        .cart-btn {
          position: relative;
        }
        .cart-badge-count {
          position: absolute;
          top: -2px;
          right: -2px;
          background-color: var(--color-accent);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .search-wrapper {
          position: relative;
        }
        .navbar-search-form {
          position: absolute;
          right: 0;
          top: 48px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color-dark);
          padding: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          width: 280px;
          box-shadow: var(--shadow-md);
          border-radius: 4px;
          z-index: 10;
        }
        .navbar-search-form input {
          width: 100%;
          border: none;
          padding: 6px 10px;
          font-size: 0.85rem;
        }
        .navbar-search-form input:focus {
          box-shadow: none;
        }
        .search-submit-btn {
          color: var(--color-accent);
          padding: 8px;
        }
        .profile-menu-container {
          position: relative;
        }
        .profile-trigger {
          overflow: hidden;
          padding: 0;
          width: 36px;
          height: 36px;
        }
        .user-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 1px solid var(--border-color-dark);
        }
        .profile-dropdown {
          position: absolute;
          right: 0;
          top: 48px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color-dark);
          width: 220px;
          box-shadow: var(--shadow-lg);
          border-radius: 4px;
          padding: 12px 0;
          z-index: 20;
        }
        .dropdown-header {
          padding: 8px 16px;
        }
        .user-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-text-main);
        }
        .user-email {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .dropdown-divider {
          border: 0;
          border-top: 1px solid var(--border-color);
          margin: 8px 0;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          font-size: 0.85rem;
          color: var(--color-text-muted);
          width: 100%;
          text-align: left;
          transition: var(--transition);
        }
        .dropdown-item:hover {
          background-color: var(--bg-secondary);
          color: var(--color-accent);
        }
        .logout-btn {
          color: #A34E36;
        }
        .logout-btn:hover {
          background-color: #FDF2F0;
          color: #A34E36;
        }
        .mobile-menu-btn {
          display: none;
          color: var(--color-text-main);
          padding: 8px;
        }
        .mobile-nav-drawer {
          position: absolute;
          top: 80px;
          left: 0;
          width: 100%;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
          padding: 24px;
          z-index: 99;
        }
        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mobile-nav-links a {
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--color-text-muted);
        }
        .mobile-logout-btn {
          text-align: left;
          color: #A34E36;
          font-weight: 500;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
          .navbar-container {
            padding: 0 16px;
          }
          .brand-logo {
            font-size: 1.5rem;
          }
        }
      `}} />
    </header>
  );
};

export default Navbar;
