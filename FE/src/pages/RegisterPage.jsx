import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User, Mail, Lock, UserPlus, AlertCircle, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

const RegisterPage = () => {
  const { register, user, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Verification state
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [resending, setResending] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Định dạng Email không hợp lệ.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      if (res.needsVerification) {
        setOtpEmail(res.email || email);
        setShowOtpStep(true);
        setSuccessMsg(res.message || "Mã OTP xác thực đã được gửi đến email của bạn.");
      } else {
        navigate(redirectUrl);
      }
    } else {
      setErrorMsg(res.message || "Đăng ký thất bại. Email có thể đã được đăng ký.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg("Vui lòng nhập mã OTP.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await authAPI.verifyOtpRegister(otpEmail, otp);
      setLoading(false);
      if (res.success) {
        setSuccessMsg("Xác thực tài khoản thành công! Đang đăng nhập...");
        if (res.data?.user) {
          setUser(res.data.user);
        }
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1500);
      } else {
        setErrorMsg(res.message || "Mã OTP không chính xác.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || "Xác thực OTP thất bại. Vui lòng thử lại.");
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await authAPI.resendOtpRegister(otpEmail);
      setResending(false);
      if (res.success) {
        setSuccessMsg("Mã OTP mới đã được gửi đến email của bạn.");
      } else {
        setErrorMsg(res.message || "Không thể gửi lại mã OTP.");
      }
    } catch (err) {
      setResending(false);
      setErrorMsg(err.response?.data?.message || "Gửi lại OTP thất bại.");
    }
  };

  return (
    <div className="register-page-wrapper container animate-fade-in">
      <div className="register-card">
        {!showOtpStep ? (
          <>
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
          </>
        ) : (
          <>
            <div className="register-card-header">
              <ShieldCheck size={48} className="otp-header-icon" />
              <h2>Xác thực Email</h2>
              <p>Chúng tôi đã gửi mã OTP 6 chữ số đến email: <strong>{otpEmail}</strong></p>
            </div>

            {errorMsg && (
              <div className="register-error-alert animate-fade-in">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="register-success-alert animate-fade-in">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="register-form">
              <div className="input-group">
                <label htmlFor="otp-code">Nhập mã OTP 6 số *</label>
                <div className="input-icon-wrapper">
                  <KeyRound size={16} className="input-icon" />
                  <input
                    type="text"
                    id="otp-code"
                    maxLength={6}
                    placeholder="X X X X X X"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    style={{ letterSpacing: "8px", textAlign: "center", fontSize: "1.2rem", fontWeight: "bold" }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? "Đang xác thực..." : "Xác nhận & Hoàn tất"}
              </button>
            </form>

            <div className="otp-resend-row">
              <button 
                type="button" 
                className="otp-resend-btn" 
                onClick={handleResendOtp}
                disabled={resending}
              >
                {resending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
              </button>
              <button 
                type="button" 
                className="otp-back-btn" 
                onClick={() => setShowOtpStep(false)}
              >
                Quay lại đăng ký
              </button>
            </div>
          </>
        )}
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

        .register-success-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #EBF8EE;
          border: 1px solid #C3EED0;
          color: #2E6B42;
          padding: 12px 16px;
          font-size: 0.85rem;
          margin-bottom: 24px;
        }

        .otp-header-icon {
          color: var(--color-accent);
          margin: 0 auto 16px;
          display: block;
        }

        .otp-resend-row {
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
          gap: 12px;
        }
        .otp-resend-btn {
          font-size: 0.85rem;
          color: var(--color-accent);
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .otp-resend-btn:hover {
          text-decoration: underline;
        }
        .otp-resend-btn:disabled {
          color: var(--color-text-muted);
          cursor: not-allowed;
          text-decoration: none;
        }
        .otp-back-btn {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .otp-back-btn:hover {
          color: var(--color-text-main);
          text-decoration: underline;
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
