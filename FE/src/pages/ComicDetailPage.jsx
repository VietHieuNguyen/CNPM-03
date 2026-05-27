import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, BookOpen, AlertCircle, CheckCircle2, Truck } from "lucide-react";
import { comicAPI, cartAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ComicCard, { formatPrice } from "../components/ComicCard";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ComicDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, fetchCart } = useCart();

  const [comic, setComic] = useState(null);
  const [similarComics, setSimilarComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Purchase quantity state
  const [quantity, setQuantity] = useState(1);
  const [cartAdding, setCartAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Reading preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activePreviewPage, setActivePreviewPage] = useState(0);

  // Fetch comic details
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await comicAPI.getDetail(slug);
        if (res.success && res.data.comic) {
          const fetchedComic = res.data.comic;
          setComic(fetchedComic);
          setQuantity(1);

          // Fetch similar comics based on category
          if (fetchedComic.category?._id) {
            const similarRes = await comicAPI.getSimilar(fetchedComic.category._id, fetchedComic._id);
            if (similarRes.success) {
              setSimilarComics(similarRes.data.comics);
            }
          }
        } else {
          setError("Không tìm thấy cuốn truyện này.");
        }
      } catch (err) {
        console.error("Fetch detail error:", err);
        setError("Có lỗi xảy ra khi tải thông tin truyện.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Đang lật giở từng trang sách...</p>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="container detail-error-area">
        <AlertCircle size={48} color="var(--color-accent)" />
        <h2>Không tìm thấy tác phẩm</h2>
        <p>{error || "Đầu sách không tồn tại hoặc đã bị ẩn."}</p>
        <Link to="/collection" className="btn-primary" style={{ marginTop: "24px" }}>
          Quay lại bộ sưu tập
        </Link>
      </div>
    );
  }

  const {
    _id,
    title,
    author,
    description,
    price,
    discount = 0,
    images = [],
    stock,
    rating = { avg: 4.8, count: 125 },
    category,
    tags = [],
    publisher = "NXB Kim Đồng",
    publishYear = 2024,
    volumes = 1,
  } = comic;

  const finalPrice = price * (1 - discount / 100);
  const productCode = `KOM-${_id.slice(-5).toUpperCase()}`;
  
  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : [
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80"
  ];



  const adjustQuantity = (amount) => {
    const nextQty = quantity + amount;
    if (nextQty >= 1 && nextQty <= stock) {
      setQuantity(nextQty);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setCartAdding(true);
    const res = await addToCart(_id, quantity);
    setCartAdding(false);

    if (res.success) {
      setToastMessage({ type: "success", text: `Đã thêm ${quantity} cuốn vào giỏ hàng thành công!` });
      fetchCart();
    } else {
      setToastMessage({ type: "error", text: res.message || "Lỗi khi thêm vào giỏ hàng." });
    }

    setTimeout(() => setToastMessage(null), 3000);
  };

  // Preview Pages Simulation
  const previewPages = [
    {
      title: "Chương 1: Bình Yên Trong Vết Nứt",
      text: "Mưa rơi tầm tã ngoài hiên nhà gỗ. Hiroshi lặng lẽ ngồi mài dũa góc nghiêng của chiếc bát trà đất sét nung đỏ. Có một vết rạn mỏng chạy dọc từ vành bát xuống đáy, lấp lánh như tia sét nhỏ...",
      image: displayImages[0]
    },
    {
      title: "Chương 1: Bình Yên Trong Vết Nứt (Tiếp)",
      text: "Lão hàng xóm bước vào, đem theo hơi ẩm của cơn mưa chiều muộn. Lão đặt một cuốn sổ tay sờn góc lên bàn gỗ tếch: 'Hãy vẽ lại những nét nghiêng của mái hiên dưới mưa, ta thấy nó giống như tâm tư của cháu lúc này...'",
      image: similarComics[0]?.images?.[0] || displayImages[0]
    },
    {
      title: "Lời Kết",
      text: "Sự hoàn hảo nằm ở chỗ chấp nhận những điều không hoàn mỹ. Dòng thời gian là một nét cọ, và mỗi vết rạn đều chứa đựng linh hồn của nghệ nhân.",
      image: similarComics[1]?.images?.[0] || displayImages[0]
    }
  ];

  return (
    <div className="detail-page-wrapper container animate-fade-in">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Trang chủ</Link> / <Link to="/collection">Góc đọc</Link> / <span>{title}</span>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`toast-alert ${toastMessage.type} animate-fade-in`}>
          {toastMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main product card layout */}
      <div className="product-detail-grid">
        {/* Left pane: Slider cover image */}
        <div className="product-images-pane">
          <div className="detail-slider-container">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={displayImages.length > 1}
              pagination={displayImages.length > 1 ? { clickable: true } : false}
              spaceBetween={0}
              slidesPerView={1}
              style={{ width: "100%", height: "100%" }}
            >
              {displayImages.map((img, idx) => (
                <SwiperSlide key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={img} alt={`${title} - ${idx + 1}`} className="detail-main-img" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="detail-tags-badges">
            {tags.map((tag, idx) => (
              <span key={idx} className="tag-badge-detail">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right pane: Book Title, Ratings, Quote and Purchase option */}
        <div className="product-info-pane">
          <h1 className="product-title">{title}</h1>
          
          <div className="author-rating-row">
            <p className="product-author">Tác giả: <span>{author}</span></p>
            <div className="rating-info">
              <Star size={14} fill="var(--color-accent)" color="var(--color-accent)" />
              <span>{rating.avg || 4.8}</span>
              <span className="rating-count">({rating.count || 120} đánh giá)</span>
            </div>
          </div>

          {/* Earthy Quote box */}
          <blockquote className="editorial-quote-box">
            "Giữa những ồn ào của thế gian, ta tìm thấy bình yên trong những vết nứt của chiếc chén cũ, hay tiếng lá rơi chạm vào mặt đất ẩm ướt."
          </blockquote>

          <div className="product-desc-paragraph">
            <p>{description || "Một câu chuyện mang đậm tinh thần Wabi-sabi nhẹ nhàng về cuộc sống thường nhật, khuyến khích độc giả dừng lại và trân trọng những khoảnh khắc đời thường, những điều giản đơn nhưng chứa đựng ý nghĩa sâu sắc..."}</p>
          </div>

          {/* Physical specs table */}
          <div className="specs-table-grid">
            <div className="spec-item">
              <span className="spec-label">Mã sản phẩm</span>
              <span className="spec-val">{productCode}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Dạng bìa</span>
              <span className="spec-val">Bìa mềm, giấy mỹ thuật</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Ngôn ngữ</span>
              <span className="spec-val">Tiếng Việt</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Số trang</span>
              <span className="spec-val">{volumes * 216} trang</span>
            </div>
          </div>

          {/* Price & Cart block */}
          <div className="purchase-card-block">
            <div className="price-row">
              <span className="price-label">Giá niêm yết</span>
              <div className="price-values">
                <span className="final-price">{formatPrice(finalPrice)}</span>
                {discount > 0 && <span className="original-price">{formatPrice(price)}</span>}
              </div>
            </div>

            <div className="purchase-controls">
              {/* Quantity control */}
              <div className="quantity-control-detail">
                <button 
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                  className="qty-btn"
                >-</button>
                <span className="qty-val">{quantity}</span>
                <button 
                  onClick={() => adjustQuantity(1)}
                  disabled={quantity >= stock}
                  className="qty-btn"
                >+</button>
              </div>

              {/* Action buttons */}
              <div className="action-buttons-detail">
                <button
                  className="btn-primary add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={stock <= 0 || cartAdding}
                >
                  <ShoppingCart size={18} />
                  {stock <= 0 ? "Tạm hết hàng" : cartAdding ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
                </button>

                <button
                  className="btn-secondary read-preview-btn"
                  onClick={() => setPreviewOpen(true)}
                >
                  Đọc thử ngay
                </button>
              </div>
            </div>

            <div className="trust-badges-row">
              <span><Truck size={14} /> Giao nhanh 24h</span>
              <span>✓ Chính hãng 100%</span>
              <span style={{ color: stock > 0 ? "#438258" : "#A34E36", fontWeight: "600" }}>
                {stock > 0 ? `Còn hàng (${stock} cuốn)` : "Hết hàng"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Works Grid */}
      {similarComics.length > 0 && (
        <section className="similar-products-section">
          <div className="section-header">
            <h2 className="section-title">Tác phẩm tương tự</h2>
            <Link to="/collection" className="view-all-link">
              Xem tất cả
            </Link>
          </div>

          <div className="grid-products">
            {similarComics.slice(0, 4).map((item) => (
              <ComicCard key={item._id} comic={item} />
            ))}
          </div>
        </section>
      )}

      {/* Simulated Read Preview Modal */}
      {previewOpen && (
        <div className="preview-modal-overlay animate-fade-in">
          <div className="preview-modal-container">
            <div className="preview-modal-header">
              <h3>Đọc thử: {title}</h3>
              <button className="close-preview-btn" onClick={() => setPreviewOpen(false)}>×</button>
            </div>
            
            <div className="preview-modal-body">
              <div className="preview-book-layout">
                <div className="preview-book-image-pane">
                  <img src={previewPages[activePreviewPage].image} alt="Page illust" />
                </div>
                <div className="preview-book-text-pane">
                  <h4 className="preview-page-title">{previewPages[activePreviewPage].title}</h4>
                  <p className="preview-page-content">{previewPages[activePreviewPage].text}</p>
                </div>
              </div>
            </div>

            <div className="preview-modal-footer">
              <button
                className="btn-secondary"
                disabled={activePreviewPage === 0}
                onClick={() => setActivePreviewPage(p => p - 1)}
              >
                Trang trước
              </button>
              <span>Trang {activePreviewPage + 1} / {previewPages.length}</span>
              <button
                className="btn-secondary"
                disabled={activePreviewPage === previewPages.length - 1}
                onClick={() => setActivePreviewPage(p => p + 1)}
              >
                Trang tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .breadcrumbs {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          padding-top: 24px;
          margin-bottom: 32px;
        }
        .breadcrumbs a:hover {
          color: var(--color-accent);
        }
        
        .detail-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          gap: 16px;
        }
        .detail-error-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
        }
        
        .toast-alert {
          position: fixed;
          top: 96px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background-color: white;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          border-radius: 4px;
          z-index: 999;
          font-size: 0.9rem;
        }
        .toast-alert.success {
          border-left: 4px solid #438258;
          color: #2e5c3e;
        }
        .toast-alert.error {
          border-left: 4px solid #A34E36;
          color: #793724;
        }

        .product-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 56px;
          align-items: start;
        }

        /* Left Image Area */
        .product-images-pane {
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
        }
        .detail-slider-container {
          position: relative;
          aspect-ratio: 3 / 4;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          width: 100%;
        }
        .detail-slider-container .swiper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .detail-slider-container .swiper-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .detail-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* Swiper custom overrides */
        .detail-slider-container .swiper-button-next,
        .detail-slider-container .swiper-button-prev {
          color: var(--color-accent) !important;
          background: rgba(250, 246, 240, 0.9);
          border: 1px solid var(--border-color);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          margin-top: -14px !important;
        }
        .detail-slider-container .swiper-button-next:hover,
        .detail-slider-container .swiper-button-prev:hover {
          background: var(--color-accent);
          color: white !important;
        }
        .detail-slider-container .swiper-button-next:after,
        .detail-slider-container .swiper-button-prev:after {
          font-size: 10px !important;
          font-weight: bold;
        }
        .detail-slider-container .swiper-pagination-bullet {
          background-color: rgba(108, 61, 47, 0.4) !important;
          opacity: 1;
        }
        .detail-slider-container .swiper-pagination-bullet-active {
          background-color: var(--color-accent) !important;
          width: 16px;
          border-radius: 4px;
        }
        
        .detail-tags-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag-badge-detail {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background-color: #ECE5DC;
          color: var(--color-text-main);
          padding: 4px 12px;
          border-radius: 2px;
        }

        /* Right Content Area */
        .product-title {
          font-size: 3rem;
          line-height: 1.15;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .author-rating-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 24px;
        }
        .product-author {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--color-text-muted);
          font-size: 1.2rem;
        }
        .product-author span {
          font-family: var(--font-sans);
          font-style: normal;
          font-weight: 600;
          color: var(--color-text-main);
        }
        .rating-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .editorial-quote-box {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 1.15rem;
          border-left: 2px solid var(--color-accent);
          padding-left: 16px;
          color: var(--color-text-main);
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .product-desc-paragraph {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .specs-table-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px 32px;
          padding: 20px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          margin-bottom: 32px;
        }
        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .spec-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }
        .spec-val {
          font-size: 0.9rem;
          font-weight: 600;
        }

        /* Purchase Box */
        .purchase-card-block {
          border: 1px solid var(--border-color-dark);
          background-color: var(--bg-secondary);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }
        .price-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }
        .price-values {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }
        .final-price {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-accent);
        }
        .purchase-controls {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        
        .quantity-control-detail {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color-dark);
          background-color: white;
          border-radius: 2px;
          height: 48px;
        }
        .qty-btn {
          width: 40px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 600;
        }
        .qty-btn:disabled {
          opacity: 0.3;
        }
        .qty-val {
          width: 40px;
          text-align: center;
          font-weight: 600;
          font-size: 1rem;
        }

        .action-buttons-detail {
          display: flex;
          gap: 12px;
          flex: 1;
        }
        .add-to-cart-btn {
          flex: 1.4;
          height: 48px;
          font-size: 0.95rem;
        }
        .read-preview-btn {
          flex: 1;
          height: 48px;
          font-size: 0.95rem;
          background-color: white;
        }
        
        .trust-badges-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          flex-wrap: wrap;
          gap: 8px;
        }

        .similar-products-section {
          margin-top: 80px;
          padding-top: 48px;
          border-top: 1px solid var(--border-color);
        }

        /* Reading Modal */
        .preview-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(42, 36, 33, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 24px;
        }
        .preview-modal-container {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color-dark);
          width: 100%;
          max-width: 900px;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }
        .preview-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
        }
        .preview-modal-header h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
        }
        .close-preview-btn {
          font-size: 1.8rem;
          color: var(--color-text-muted);
        }
        .close-preview-btn:hover {
          color: var(--color-accent);
        }
        .preview-modal-body {
          padding: 32px;
          overflow-y: auto;
          flex: 1;
          background-color: #FAF5EE;
        }
        .preview-book-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: center;
        }
        .preview-book-image-pane img {
          width: 100%;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          border: 1px solid var(--border-color);
        }
        .preview-book-text-pane {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .preview-page-title {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          color: var(--color-accent);
        }
        .preview-page-content {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 1.15rem;
          color: var(--color-text-main);
          line-height: 1.8;
        }
        .preview-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
        }

        @media (max-width: 992px) {
          .product-detail-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .product-images-pane {
            max-width: 480px;
            margin: 0 auto;
            width: 100%;
          }
          .product-title {
            font-size: 2.2rem;
          }
          .preview-book-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}} />
    </div>
  );
};

export default ComicDetailPage;
