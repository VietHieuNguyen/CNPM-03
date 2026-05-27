import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Key, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { authAPI } from "../services/api";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Input email, 2: Input OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Vui lòng nhập địa chỉ email.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      const res = await authAPI.forgotPassword(email);
      if (res.success) {
        setMessage(res.message || "Mã OTP đã được gửi thành công!");
        setStep(2);
      } else {
        setErrorMsg(res.message || "Gửi mã OTP thất bại.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Không thể gửi mã OTP. Vui lòng kiểm tra lại email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      const res = await authAPI.resetPassword(email, otp, newPassword);
      if (res.success) {
        setMessage(res.message || "Khôi phục mật khẩu thành công!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setErrorMsg(res.message || "Khôi phục mật khẩu thất bại.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page-wrapper container animate-fade-in">
      <div className="forgot-card">
        <Link to="/login" className="back-link">
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </Link>

        <div className="forgot-card-header" style={{ marginTop: "16px" }}>
          <h2>Khôi phục mật khẩu</h2>
          <p>
            {step === 1
              ? "Nhập email của bạn để nhận mã xác thực OTP khôi phục mật khẩu."
              : `Nhập mã OTP đã được gửi đến email ${email} và mật khẩu mới.`}
          </p>
        </div>

        {errorMsg && (
          <div className="forgot-error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {message && (
          <div className="forgot-success-alert animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="forgot-form">
            <div className="input-group">
              <label htmlFor="forgot-email">Địa chỉ Email của bạn</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="vi-du@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="forgot-submit-btn" disabled={loading}>
              <Key size={18} />
              {loading ? "Đang gửi mã OTP..." : "Gửi mã xác thực OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="forgot-form">
            <div className="input-group">
              <label htmlFor="forgot-otp">Nhập mã xác thực OTP (6 chữ số)</label>
              <div className="input-icon-wrapper">
                <Key size={16} className="input-icon" />
                <input
                  type="text"
                  id="forgot-otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="forgot-new-password">Mật khẩu mới</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  id="forgot-new-password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="forgot-confirm-password">Xác nhận mật khẩu mới</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  id="forgot-confirm-password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="forgot-submit-btn" disabled={loading}>
              <CheckCircle2 size={18} />
              {loading ? "Đang cập nhật mật khẩu..." : "Đặt lại mật khẩu"}
            </button>

            <button
              type="button"
              className="btn-link-resend"
              onClick={() => setStep(1)}
              style={{ marginTop: "10px", textAlign: "center", width: "100%" }}
            >
              Gửi lại mã OTP khác
            </button>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .forgot-page-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          padding-top: 48px;
        }
        .forgot-card {
          width: 100%;
          max-width: 440px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 48px 40px;
          box-shadow: var(--shadow-md);
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--color-text-muted);
          width: fit-content;
        }
        .back-link:hover {
          color: var(--color-accent);
        }
        .forgot-card-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .forgot-card-header h2 {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          color: var(--color-accent);
          margin-bottom: 8px;
        }
        .forgot-card-header p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          line-height: 1.5;
        }

        .forgot-error-alert {
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

        .forgot-success-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #F0F7F2;
          border: 1px solid #D6EADF;
          color: #2E5C3E;
          padding: 12px 16px;
          font-size: 0.85rem;
          margin-bottom: 24px;
        }

        .forgot-form {
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

        .forgot-submit-btn {
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
        .forgot-submit-btn:hover {
          background-color: var(--color-accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .forgot-submit-btn:disabled {
          background-color: var(--border-color-dark);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .btn-link-resend {
          background: transparent;
          border: none;
          color: var(--color-accent);
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .btn-link-resend:hover {
          text-decoration: underline;
        }
      `}} />
    </div>
  );
};

export default ForgotPasswordPage;
