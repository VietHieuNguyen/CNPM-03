import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconBook } from "../components/Icons";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

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
from-[#f3f6f0]
via-[#fbfcfb]
to-[#edf2e8]
px-16
py-14
">
          
          <div className="relative z-10 flex flex-col justify-between">
            
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5a7247] shadow-lg">
                  <IconBook className="h-7 w-7 text-white" />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#7a8672]">
                    Welcome to
                  </p>

                  <h1 className="text-2xl font-black tracking-tight text-[#3d2b1a]">
                    MangaStore
                  </h1>
                </div>
              </div>

              <h2 className="max-w-md text-5xl font-black leading-[1.1] tracking-tight text-[#3d2b1a]">
                Trở thành
                <span className="block text-[#5a7247]">
                  thành viên mới
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-[15px] leading-8 text-[#6b5744]">
                Tham gia cộng đồng truyện tranh lớn nhất Việt Nam.
                Nhận ngay ưu đãi voucher giảm giá 20% cho đơn hàng đầu tiên!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/50 bg-white/70 p-5 backdrop-blur-sm">
                <p className="text-3xl font-black text-[#5a7247]">
                  20% OFF
                </p>
                <p className="mt-1 text-sm text-[#7a6755]">
                  Voucher chào mừng
                </p>
              </div>

              <div className="rounded-2xl border border-white/50 bg-white/70 p-5 backdrop-blur-sm">
                <p className="text-3xl font-black text-[#b5503a]">
                  Free
                </p>
                <p className="mt-1 text-sm text-[#7a6755]">
                  Tài khoản vĩnh viễn
                </p>
              </div>
            </div>
          </div>

          {/* DECOR */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#5a7247]/10 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[#b5503a]/10 blur-3xl" />
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#5a7247] to-[#4c5e3a] shadow-lg">
                <IconBook className="h-8 w-8 text-white" />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#3d2b1a]">
                MangaStore
              </h1>

              <p className="mt-2 text-sm text-[#8f7b68]">
                Đăng ký tài khoản mới
              </p>
            </div>

            {/* HEADER */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#5a7247]">
                Join Us
              </p>

              <h2 className="text-4xl font-black tracking-tight text-[#3d2b1a]">
                Đăng ký
              </h2>

              <p className="mt-3 text-[15px] leading-7 text-[#7a6755]">
                Tạo tài khoản và tham gia cùng hàng nghìn độc giả ngay lập tức.
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* DISPLAY NAME */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4d3b2b]">
                  Tên hiển thị
                </label>

                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tên của bạn"
                  id="register-name"
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
                    focus:border-[#5a7247]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#5a7247]/10
                  "
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4d3b2b]">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  id="register-email"
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
                    focus:border-[#5a7247]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#5a7247]/10
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    id="register-password"
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
                      focus:border-[#5a7247]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#5a7247]/10
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
                      hover:text-[#5a7247]
                    "
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4d3b2b]">
                  Xác nhận mật khẩu
                </label>

                <input
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  id="register-confirm"
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
                    focus:border-[#5a7247]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#5a7247]/10
                  "
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                id="register-submit-btn"
                className="
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#5a7247]
                  text-[15px]
                  font-bold
                  text-white
                  shadow-lg
                  shadow-[#5a7247]/20
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#4c5e3a]
                  hover:shadow-xl
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  cursor-pointer
                "
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  'Đăng Ký Ngay'
                )}
              </button>
            </form>

            {/* FOOTER */}
            <div className="mt-8 border-t border-[#eee4d8] pt-6 text-center">
              <p className="text-sm text-[#7a6755]">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  id="register-to-login-link"
                  className="font-bold text-[#b5503a] hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
