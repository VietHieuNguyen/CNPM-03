import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const redirectUrl = searchParams.get("redirect") || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectUrl);
    }
  }, [user, navigate, redirectUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl);
    } else {
      setErrorMsg(res.message || "Đăng nhập thất bại. Email hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="login-page-wrapper container animate-fade-in">
      <div className="login-card">
        <div className="login-card-header">
          <h2>Komorebi Manga</h2>
          <p>Chào mừng độc giả quay trở lại cửa hàng sách.</p>
        </div>

        {errorMsg && (
          <div className="login-error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="login-email">Địa chỉ Email</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                id="login-email"
                placeholder="nhapemail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Mật khẩu</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                id="login-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            <LogIn size={18} />
            {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
          </button>
        </form>

        <div className="login-card-footer">
          <p>Chưa có tài khoản?</p>
          <Link to={`/register?redirect=${encodeURIComponent(redirectUrl)}`} className="register-redirect-link">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .login-page-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          padding-top: 48px;
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 48px 40px;
          box-shadow: var(--shadow-md);
        }
        .login-card-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-card-header h2 {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          color: var(--color-accent);
          margin-bottom: 8px;
        }
        .login-card-header p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .login-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #FDF2F0;
          border: 1px solid #F3C4B8;
          color: #A34E36;
          padding: 12px 16px;
          font-size: 0.85rem;
          margin-bottom: 24px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .input-group label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          color: var(--color-text-main);
        }
        
        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--color-text-muted);
        }
        .input-icon-wrapper input {
          width: 100%;
          padding-left: 42px;
          background-color: white;
        }

        .login-submit-btn {
          width: 100%;
          background-color: var(--color-accent);
          color: white;
          padding: 14px;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 2px;
          margin-top: 10px;
          box-shadow: var(--shadow-sm);
        }
        .login-submit-btn:hover {
          background-color: var(--color-accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .login-submit-btn:disabled {
          background-color: var(--border-color-dark);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .login-card-footer {
          margin-top: 32px;
          text-align: center;
          border-top: 1px dashed var(--border-color-dark);
          padding-top: 24px;
          font-size: 0.85rem;
        }
        .login-card-footer p {
          color: var(--color-text-muted);
          margin-bottom: 6px;
        }
        .register-redirect-link {
          font-weight: 600;
          color: var(--color-accent);
        }
        .register-redirect-link:hover {
          text-decoration: underline;
        }
      `}} />
    </div>
  );
};

export default LoginPage;
