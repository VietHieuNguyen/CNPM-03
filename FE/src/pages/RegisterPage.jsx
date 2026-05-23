import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User, Mail, Lock, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState("");
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
    if (!name || !email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ tất cả thông tin yêu cầu.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl);
    } else {
      setErrorMsg(res.message || "Đăng ký thất bại. Email có thể đã được đăng ký.");
    }
  };

  return (
    <div className="register-page-wrapper container animate-fade-in">
      <div className="register-card">
        <div className="register-card-header">
          <h2>Độc giả mới</h2>
          <p>Tạo tài khoản thành viên để bắt đầu hành trình tĩnh lặng.</p>
        </div>

        {errorMsg && (
          <div className="register-error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label htmlFor="reg-name">Họ và tên *</label>
            <div className="input-icon-wrapper">
              <User size={16} className="input-icon" />
              <input
                type="text"
                id="reg-name"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Địa chỉ Email *</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                id="reg-email"
                placeholder="nhapemail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-password">Mật khẩu * (Tối thiểu 6 ký tự)</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                id="reg-password"
                placeholder="Mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="register-submit-btn" disabled={loading}>
            <UserPlus size={18} />
            {loading ? "Đang xử lý đăng ký..." : "Đăng ký thành viên"}
          </button>
        </form>

        <div className="register-card-footer">
          <p>Đã có tài khoản thành viên?</p>
          <Link to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="login-redirect-link">
            Đăng nhập ngay tại đây
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .register-page-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          padding-top: 48px;
        }
        .register-card {
          width: 100%;
          max-width: 440px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 48px 40px;
          box-shadow: var(--shadow-md);
        }
        .register-card-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .register-card-header h2 {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          color: var(--color-accent);
          margin-bottom: 8px;
        }
        .register-card-header p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .register-error-alert {
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

        .register-form {
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

        .register-submit-btn {
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
        .register-submit-btn:hover {
          background-color: var(--color-accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .register-submit-btn:disabled {
          background-color: var(--border-color-dark);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .register-card-footer {
          margin-top: 32px;
          text-align: center;
          border-top: 1px dashed var(--border-color-dark);
          padding-top: 24px;
          font-size: 0.85rem;
        }
        .register-card-footer p {
          color: var(--color-text-muted);
          margin-bottom: 6px;
        }
        .login-redirect-link {
          font-weight: 600;
          color: var(--color-accent);
        }
        .login-redirect-link:hover {
          text-decoration: underline;
        }
      `}} />
    </div>
  );
};

export default RegisterPage;
