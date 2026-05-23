import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Compass, ShieldCheck } from "lucide-react";
import { comicAPI } from "../services/api";
import ComicCard from "../components/ComicCard";

const HomePage = () => {
  const [newComics, setNewComics] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [featuredComics, setFeaturedComics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [resNew, resBest, resFeatured] = await Promise.all([
          comicAPI.getNew(),
          comicAPI.getBestsellers(),
          comicAPI.getFeatured(),
        ]);
        
        if (resNew.success) setNewComics(resNew.data.comics);
        if (resBest.success) setBestsellers(resBest.data.comics);
        if (resFeatured.success) setFeaturedComics(resFeatured.data.comics);
      } catch (err) {
        console.error("Error fetching home page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <p>Đang tải bộ sưu tập...</p>
      </div>
    );
  }

  // Hero section comic (use first featured if available)
  const heroComic = featuredComics[0] || newComics[0];

  return (
    <div className="homepage-wrapper animate-fade-in">
      {/* Editorial Hero Section */}
      {heroComic && (
        <section className="hero-section container">
          <div className="hero-grid">
            <div className="hero-image-pane">
              <img src={heroComic.images?.[0]} alt={heroComic.title} />
              <div className="hero-image-badge">NỔI BẬT</div>
            </div>
            
            <div className="hero-content-pane">
              <div className="hero-breadcrumbs">
                <span>Góc đọc</span> / <span>Tác phẩm khuyên đọc</span>
              </div>
              <h1 className="hero-title">{heroComic.title}</h1>
              <p className="hero-author">Tác giả: {heroComic.author}</p>
              
              <blockquote className="hero-quote">
                "Giữa những ồn ào của thế gian, ta tìm thấy bình yên trong những vết nứt của chiếc chén cũ, hay tiếng lá rơi chạm vào mặt đất ẩm ướt."
              </blockquote>
              
              <p className="hero-description">
                {heroComic.description || "Một câu chuyện tinh tế đưa ta qua những cung bậc cảm xúc, trân trọng từng khoảnh khắc đời thường, những điều giản đơn nhưng chứa đựng ý nghĩa sâu sắc."}
              </p>
              
              <div className="hero-actions">
                <Link to={`/comic/${heroComic.slug}`} className="btn-primary">
                  Xem chi tiết <ArrowRight size={16} />
                </Link>
                <Link to="/collection" className="btn-secondary">
                  Khám phá tủ sách
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Philosophy Banner */}
      <section className="philosophy-section">
        <div className="container philosophy-container">
          <div className="philosophy-card">
            <div className="philosophy-icon"><Compass size={32} /></div>
            <h3>Khám phá sự tĩnh lặng</h3>
            <p>Tuyển chọn những câu chuyện nhẹ nhàng mang đậm tinh thần Wabi-sabi.</p>
          </div>
          <div className="philosophy-card">
            <div className="philosophy-icon"><BookOpen size={32} /></div>
            <h3>Chất lượng mỹ thuật</h3>
            <p>Sách được tuyển chọn kỹ lưỡng, chất lượng in ấn và bìa mỹ thuật cao cấp.</p>
          </div>
          <div className="philosophy-card">
            <div className="philosophy-icon"><ShieldCheck size={32} /></div>
            <h3>Giao dịch an toàn</h3>
            <p>Đóng gói bằng vật liệu thân thiện môi trường, thanh toán bảo mật.</p>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="section-featured container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Bộ tác phẩm nổi bật</h2>
            <p className="section-subtitle">Nơi lưu giữ những câu chuyện giản đơn mang lại sự tĩnh lặng.</p>
          </div>
          <Link to="/collection" className="view-all-link">
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="grid-products">
          {featuredComics.slice(0, 4).map((comic) => (
            <ComicCard key={comic._id} comic={comic} />
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="section-bestsellers bg-beige">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Tác phẩm bán chạy nhất</h2>
              <p className="section-subtitle">Được độc giả yêu thích và đón đọc nhiều nhất thời gian qua.</p>
            </div>
            <Link to="/collection?sort=bestseller" className="view-all-link">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid-products">
            {bestsellers.slice(0, 4).map((comic) => (
              <ComicCard key={comic._id} comic={comic} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="section-new container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Tác phẩm mới về</h2>
            <p className="section-subtitle">Cập nhật những đầu sách và tập truyện mới nhất trên kệ hàng.</p>
          </div>
          <Link to="/collection?sort=newest" className="view-all-link">
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="grid-products">
          {newComics.slice(0, 4).map((comic) => (
            <ComicCard key={comic._id} comic={comic} />
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .home-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          gap: 16px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hero-section {
          padding-top: 48px;
          padding-bottom: 48px;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 64px;
          align-items: center;
        }
        .hero-image-pane {
          position: relative;
          aspect-ratio: 4 / 5;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
        }
        .hero-image-pane img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-image-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background-color: var(--color-accent);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          letter-spacing: 0.05em;
        }
        .hero-content-pane {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hero-breadcrumbs {
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--color-text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .hero-title {
          font-size: 3.2rem;
          line-height: 1.15;
          margin-bottom: 8px;
          font-weight: 400;
        }
        .hero-author {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--color-text-muted);
          font-size: 1.3rem;
          margin-bottom: 24px;
        }
        .hero-quote {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 1.15rem;
          border-left: 2px solid var(--color-accent);
          padding-left: 16px;
          margin-bottom: 24px;
          color: var(--color-text-main);
          line-height: 1.6;
        }
        .hero-description {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          margin-bottom: 32px;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .philosophy-section {
          background-color: #F3ECE2;
          padding: 48px 0;
          margin: 48px 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }
        .philosophy-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
        }
        .philosophy-card {
          text-align: center;
          padding: 16px;
        }
        .philosophy-icon {
          color: var(--color-accent);
          margin-bottom: 16px;
        }
        .philosophy-card h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          margin-bottom: 8px;
        }
        .philosophy-card p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          max-width: 260px;
          margin: 0 auto;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
        }
        .view-all-link {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--color-accent);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 1.05rem;
          padding-bottom: 4px;
          border-bottom: 1px dashed var(--color-accent);
        }
        .view-all-link:hover {
          color: var(--color-accent-hover);
          border-bottom-style: solid;
        }

        .bg-beige {
          background-color: #FAF5EE;
          padding: 64px 0;
          margin: 64px 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }
        .section-featured, .section-new {
          padding: 32px 0;
        }

        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .hero-title {
            font-size: 2.4rem;
          }
          .hero-image-pane {
            max-width: 480px;
            margin: 0 auto;
          }
        }
      `}} />
    </div>
  );
};

export default HomePage;
