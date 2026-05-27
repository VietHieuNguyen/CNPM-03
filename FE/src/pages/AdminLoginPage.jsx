import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldAlert, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLoginPage = () => {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already logged in as Admin
  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin đăng nhập.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // If currently logged in as a member, logout first
      if (user && user.role !== "admin") {
        await logout();
      }

      const res = await login(email, password);
      if (res.success) {
        const role = res.data?.user?.role;
        if (role === "admin") {
          navigate("/admin");
        } else {
          await logout();
          setErrorMsg("Tài khoản của bạn không có quyền truy cập quản trị.");
        }
      } else {
        setErrorMsg(res.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Đã xảy ra lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page-wrapper animate-scale-up">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-logo-section">
            <div className="shield-icon-box">
              <ShieldAlert size={36} color="#A34E36" />
            </div>
            <h2>HỆ THỐNG QUẢN TRỊ</h2>
            <p>Komorebi Manga Store Admin Panel</p>
          </div>

          {errorMsg && (
            <div className="admin-login-error animate-fade-in">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group-admin">
              <label htmlFor="admin-email">Tài khoản quản trị (Email)</label>
              <div className="admin-input-wrapper">
                <Mail size={16} className="admin-input-icon" />
                <input
                  type="email"
                  id="admin-email"
                  placeholder="admin@komorebi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group-admin">
              <label htmlFor="admin-password">Mật khẩu</label>
              <div className="admin-input-wrapper">
                <Lock size={16} className="admin-input-icon" />
                <input
                  type="password"
                  id="admin-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              <LogIn size={18} />
              {loading ? "Đang xác thực..." : "Đăng nhập quản trị"}
            </button>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .admin-login-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background-color: var(--bg-primary);
        }
        .admin-login-container {
          width: 100%;
          max-width: 440px;
        }
        .admin-login-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color-dark);
          padding: 40px 32px;
          box-shadow: var(--shadow-md);
        }
        .admin-logo-section {
          text-align: center;
          margin-bottom: 32px;
        }
        .shield-icon-box {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background-color: rgba(163, 78, 54, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }
        .admin-logo-section h2 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--color-text-main);
          margin-bottom: 4px;
        }
        .admin-logo-section p {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .admin-login-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background-color: rgba(163, 78, 54, 0.1);
          border-left: 4px solid #A34E36;
          color: #793724;
          font-size: 0.85rem;
          margin-bottom: 24px;
        }
        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group-admin {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group-admin label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-main);
        }
        .admin-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .admin-input-icon {
          position: absolute;
          left: 14px;
          color: var(--color-text-muted);
        }
        .admin-input-wrapper input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          font-size: 0.9rem;
          color: var(--color-text-main);
          transition: var(--transition);
        }
        .admin-input-wrapper input:focus {
          border-color: var(--color-accent);
          outline: none;
        }
        .admin-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          background-color: #A34E36;
          color: white;
          border: none;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          margin-top: 10px;
        }
        .admin-submit-btn:hover {
          background-color: #793724;
        }
        .admin-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}} />
    </div>
  );
};

export default AdminLoginPage;
