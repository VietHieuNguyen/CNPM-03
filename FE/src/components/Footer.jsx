import React from "react";
import { Link } from "react-router-dom";
import { Globe, BookOpen, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="manga-footer">
      <div className="footer-container container">
        <div className="footer-top">
          <div className="footer-brand-section">
            <h3 className="footer-logo">Komorebi Manga</h3>
            <p className="footer-desc">
              Mang đến cho độc giả những tác phẩm truyện tranh nghệ thuật, trọn vẹn trong vẻ đẹp của sự giản đơn và không hoàn hảo.
            </p>
          </div>
          
          <div className="footer-links-section">
            <div className="links-group">
              <h4 className="links-title">Cửa hàng</h4>
              <Link to="/collection">Bộ sưu tập</Link>
              <Link to="/collection?sort=newest">Mới về</Link>
              <Link to="/collection?sort=bestseller">Tác giả</Link>
            </div>
            
            <div className="links-group">
              <h4 className="links-title">Hỗ trợ</h4>
              <Link to="/">Vận chuyển</Link>
              <Link to="/">Hoàn trả</Link>
              <Link to="/">Liên hệ</Link>
            </div>

            <div className="links-group">
              <h4 className="links-title">Pháp lý</h4>
              <Link to="/">Bảo mật</Link>
              <Link to="/">Điều khoản</Link>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="copyright-text">
            © 2026 Komorebi Manga - Vẻ đẹp của sự không hoàn hảo.
          </p>
          <div className="footer-socials">
            <span className="social-icon" title="Ngôn ngữ"><Globe size={16} /></span>
            <span className="social-icon" title="Truyện tuyển chọn"><BookOpen size={16} /></span>
            <span className="social-icon" title="Tâm huyết"><Heart size={16} /></span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .manga-footer {
          background-color: #F4EDE2; /* Sleek cream contrasting slightly with main bg */
          border-top: 1px solid var(--border-color);
          padding: 64px 0 32px 0;
          margin-top: 80px;
        }
        .footer-top {
          display: flex;
          justify-content: space-between;
          gap: 48px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }
        .footer-brand-section {
          flex: 1;
          min-width: 280px;
        }
        .footer-logo {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          color: var(--color-accent);
          margin-bottom: 16px;
        }
        .footer-desc {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
          max-width: 380px;
        }
        .footer-links-section {
          display: flex;
          gap: 64px;
          flex-wrap: wrap;
        }
        .links-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .links-title {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-main);
          font-weight: 600;
          margin-bottom: 8px;
        }
        .links-group a {
          font-size: 0.9rem;
          color: var(--color-text-muted);
        }
        .links-group a:hover {
          color: var(--color-accent);
        }
        .footer-divider {
          border: 0;
          border-top: 1px solid var(--border-color-dark);
          margin-bottom: 24px;
          opacity: 0.6;
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .copyright-text {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .footer-socials {
          display: flex;
          gap: 16px;
        }
        .social-icon {
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .social-icon:hover {
          color: var(--color-accent);
        }

        @media (max-width: 768px) {
          .footer-top {
            flex-direction: column;
            gap: 32px;
          }
          .footer-links-section {
            gap: 32px;
            justify-content: space-between;
            width: 100%;
          }
          .manga-footer {
            padding: 40px 0 24px 0;
          }
        }
      `}} />
    </footer>
  );
};

export default Footer;
