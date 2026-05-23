import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { IconMenu, IconClose, IconLogout, IconCart, IconHistory } from "./Icons";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const navClass = (active, green = false) =>
    `
      relative
      py-2
      text-[15px]
      font-bold
      transition-all
      duration-300
      ${
        active
          ? "text-[#683520]"
          : "text-[#6b5744] hover:text-[#683520]"
      }
    `;

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        border-b
        border-[#eadfd2]
        bg-[#FEFEFE]/90
        backdrop-blur-xl
        shadow-[0_4px_20px_rgba(61,43,26,0.04)]
      "
    >
      <div
        className="
          mx-auto
          flex
          h-[78px]
          max-w-[1500px]
          items-center
          justify-between
          px-4
          sm:px-6
          lg:px-10
          xl:px-12
        "
      >
        {/* LOGO */}
        <Link to="/" className="group flex items-center flex-shrink-0">
          <span
            className="
              font-serif
              text-[24px]
              font-black
              tracking-wide
              text-[#683520]
              transition-colors
              duration-300
              group-hover:text-[#522918]
            "
          >
            Komorebi Manga
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div
          className="
            hidden
            md:flex
            items-center
            gap-10
            flex-1
            justify-center
          "
        >
          <Link to="/" className={navClass(isActive("/"))}>
            Trang chủ
            {isActive("/") && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#683520]" />
            )}
          </Link>

          <Link
            to="/search"
            className={navClass(
              location.pathname === "/search" && !location.search,
            )}
          >
            Truyện
            {location.pathname === "/search" && !location.search && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#683520]" />
            )}
          </Link>

          <Link
            to="/search?sort=bestseller"
            className={navClass(location.search.includes("sort=bestseller"))}
          >
            Bán chạy
            {location.search.includes("sort=bestseller") && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#683520]" />
            )}
          </Link>

          <Link
            to="/search?sort=newest"
            className={navClass(location.search.includes("sort=newest"), true)}
          >
            Mới nhất
            {location.search.includes("sort=newest") && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#683520]" />
            )}
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              {/* Order History */}
              <Link
                to="/orders"
                id="navbar-orders-link"
                title="Lịch sử đơn hàng"
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#f4ebe1]
                  text-[#6b5744]
                  transition-all
                  duration-300
                  hover:bg-[#b5503a]/10
                  hover:text-[#b5503a]
                "
              >
                <IconHistory className="h-5 w-5" />
              </Link>

              {/* Shopping Cart */}
              <Link
                to="/cart"
                id="navbar-cart-link"
                title="Giỏ hàng"
                className="
                  relative
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#f4ebe1]
                  text-[#6b5744]
                  transition-all
                  duration-300
                  hover:bg-[#b5503a]/10
                  hover:text-[#b5503a]
                "
              >
                <IconCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span
                    className="
                      absolute
                      -right-1.5
                      -top-1.5
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-[#b5503a]
                      text-[10px]
                      font-black
                      text-white
                      shadow-md
                    "
                  >
                    {totalItems}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                id="navbar-profile-link"
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-[#eadfd2]
                  bg-white
                  px-3
                  py-2
                  transition-all
                  duration-300
                  hover:border-[#b5503a]/30
                  hover:shadow-md
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-[#5a7247]
                    to-[#7d9b68]
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>

                <span
                  className="
                    max-w-[120px]
                    truncate
                    text-sm
                    font-bold
                    text-[#3d2b1a]
                  "
                >
                  {user.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                id="navbar-logout-btn"
                title="Đăng xuất"
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#f4ebe1]
                  text-[#6b5744]
                  transition-all
                  duration-300
                  hover:bg-red-50
                  hover:text-[#b5503a]
                "
              >
                <IconLogout className="h-[18px] w-[18px]" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                id="navbar-login-btn"
                className="
                  rounded-2xl
                  border
                  border-[#d8cabb]
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-[#6b5744]
                  transition-all
                  duration-300
                  hover:border-[#b5503a]
                  hover:text-[#b5503a]
                "
              >
                Đăng Nhập
              </Link>

              <Link
                to="/register"
                id="navbar-register-btn"
                className="
                  rounded-2xl
                  bg-[#b5503a]
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-[#b5503a]/20
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#a34531]
                  hover:shadow-xl
                "
              >
                Đăng Ký
              </Link>
            </div>
          )}

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            id="navbar-mobile-menu-btn"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-[#f4ebe1]
              text-[#6b5744]
              transition-colors
              md:hidden
            "
          >
            {mobileOpen ? (
              <IconClose className="h-5 w-5" />
            ) : (
              <IconMenu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div
          className="
            border-t
            border-[#eee3d7]
            bg-white
            px-4
            py-5
            md:hidden
          "
        >
          <div className="flex flex-col gap-2">
            {[
              {
                to: "/",
                label: "Trang Chủ",
              },
              {
                to: "/search",
                label: "Truyện",
              },
              {
                to: "/search?sort=bestseller",
                label: "Bán Chạy",
              },
              {
                to: "/search?sort=newest",
                label: "Mới Nhất",
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-[#6b5744]
                  transition-all
                  hover:bg-[#f8f3ed]
                  hover:text-[#b5503a]
                "
              >
                {item.label}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-[#6b5744]
                    transition-all
                    hover:bg-[#f8f3ed]
                    hover:text-[#b5503a]
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span>Giỏ hàng</span>
                  {totalItems > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#b5503a] text-[10px] font-black text-white">
                      {totalItems}
                    </span>
                  )}
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-[#6b5744]
                    transition-all
                    hover:bg-[#f8f3ed]
                    hover:text-[#b5503a]
                  "
                >
                  Đơn hàng của tôi
                </Link>
              </>
            )}

            <div className="mt-3 border-t border-[#f1e7dc] pt-4">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="
                    w-full
                    rounded-xl
                    bg-red-50
                    px-4
                    py-3
                    text-left
                    text-sm
                    font-bold
                    text-[#b5503a]
                  "
                >
                  Đăng Xuất
                </button>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    id="navbar-login-btn"
                    className="
    inline-flex
    items-center
    justify-center
    rounded-2xl
    border
    border-[#d8cabb]
    px-8
    py-3.5
    text-[15px]
    font-bold
    text-[#6b5744]
    transition-all
    duration-300
    hover:border-[#b5503a]
    hover:text-[#b5503a]
    hover:shadow-md
  "
                  >
                    Đăng Nhập
                  </Link>

                  <Link
                    to="/register"
                    id="navbar-register-btn"
                    className="
    inline-flex
    items-center
    justify-center
    rounded-2xl
    bg-[#b5503a]
    px-8
    py-3.5
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
  "
                  >
                    Đăng Ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
