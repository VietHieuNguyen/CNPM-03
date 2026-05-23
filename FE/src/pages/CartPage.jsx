import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ShieldCheck, Leaf, HelpCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../components/ComicCard";

const CartPage = () => {
  const { user } = useAuth();
  const {
    cart,
    loading,
    subtotalAmount,
    totalAmount,
    discountAmount,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const navigate = useNavigate();

  const [note, setNote] = useState("");

  const handleQtyChange = async (comicId, currentQty, amount) => {
    const targetQty = currentQty + amount;
    if (targetQty >= 1) {
      await updateQuantity(comicId, targetQty);
    }
  };

  const handleCheckoutClick = () => {
    // Navigate to checkout with notes passed in state
    navigate("/checkout", { state: { orderNote: note } });
  };

  if (!user) {
    return (
      <div className="container cart-auth-prompt animate-fade-in">
        <ShoppingBag size={48} color="var(--color-accent)" />
        <h2>Giỏ hàng của bạn</h2>
        <p>Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn.</p>
        <Link to="/login?redirect=cart" className="btn-primary" style={{ marginTop: "24px" }}>
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const cartItems = cart?.items || [];

  return (
    <div className="cart-page-wrapper container animate-fade-in">
      <div className="cart-header">
        <h1 className="cart-title">Giỏ hàng của bạn</h1>
        <p className="cart-subtitle">"Vẻ đẹp nằm trong sự giản đơn và tĩnh lặng."</p>
      </div>

      {loading && cartItems.length === 0 ? (
        <div className="cart-loading">
          <div className="spinner"></div>
          <p>Đang kiểm tra giỏ sách của bạn...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="empty-cart-view animate-fade-in">
          <ShoppingBag size={64} strokeWidth={1} color="var(--color-text-muted)" />
          <h2>Giỏ hàng đang trống</h2>
          <p>Kệ sách của bạn đang chờ những câu chuyện ý nghĩa lấp đầy.</p>
          <Link to="/collection" className="btn-primary" style={{ marginTop: "24px" }}>
            Khám phá bộ sưu tập truyện
          </Link>
        </div>
      ) : (
        <div className="cart-layout-grid">
          {/* Left Column: Cart items list */}
          <div className="cart-items-column">
            <div className="items-list-container">
              {cartItems.map((item) => {
                if (!item.comic) return null;
                const { _id, title, author, price, discount = 0, images = [], category } = item.comic;
                const finalPrice = price * (1 - discount / 100);
                const cover = images[0] || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=60";
                
                return (
                  <div key={_id} className="cart-item-card">
                    {/* Item Cover */}
                    <Link to={`/comic/${item.comic.slug}`} className="item-cover-link">
                      <img src={cover} alt={title} className="item-cover-img" />
                    </Link>

                    {/* Item Details */}
                    <div className="item-info-pane">
                      <Link to={`/comic/${item.comic.slug}`}>
                        <h4 className="item-title">{title}</h4>
                      </Link>
                      <p className="item-details-label">
                        {category ? `${category.name} ` : ""} / {author}
                      </p>

                      {/* Quantity control */}
                      <div className="item-qty-row">
                        <div className="qty-picker">
                          <button
                            onClick={() => handleQtyChange(_id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                            className="qty-picker-btn"
                          >
                            -
                          </button>
                          <span className="qty-picker-val">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(_id, item.quantity, 1)}
                            disabled={item.quantity >= item.comic.stock}
                            className="qty-picker-btn"
                          >
                            +
                          </button>
                        </div>

                        <button className="item-remove-btn" onClick={() => removeFromCart(_id)}>
                          Gỡ bỏ
                        </button>
                      </div>
                    </div>

                    {/* Price block */}
                    <div className="item-price-pane">
                      <span className="item-final-price">{formatPrice(finalPrice * item.quantity)}</span>
                      {discount > 0 && (
                        <span className="item-discount-savings">
                          Tiết kiệm {formatPrice(price * (discount / 100) * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Eco Tag */}
            <div className="eco-friendly-badge">
              <Leaf size={16} color="#438258" />
              <span>Đơn hàng của bạn sẽ được đóng gói bằng vật liệu tái chế, trân trọng môi trường.</span>
            </div>

            {/* Wabi Sabi philosophy quotes card */}
            <div className="editorial-philosophy-card">
              <p>
                "Sách không chỉ là kiến thức, mà là những cuộc trò chuyện tĩnh lặng với tâm hồn. Tại Komorebi, chúng tôi lựa chọn những tác phẩm có khả năng dừng lại thời gian."
              </p>
              <span>— TRIẾT LÝ KOMOREBI</span>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Action */}
          <div className="cart-summary-column">
            <div className="summary-card">
              <h3 className="summary-title">Tóm tắt đơn hàng</h3>
              
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotalAmount)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className="shipping-free">Miễn phí</span>
              </div>

              <hr className="summary-divider" />

              <div className="summary-row total">
                <span>Tổng cộng</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>

              {/* Note input */}
              <div className="summary-notes-field">
                <label htmlFor="order-note">Ghi chú cho Komorebi</label>
                <textarea
                  id="order-note"
                  rows="4"
                  placeholder="Nhắn nhủ điều gì đó với chúng tôi..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Checkout CTA */}
              <button className="checkout-cta-btn" onClick={handleCheckoutClick}>
                Tiếp tục thanh toán
              </button>

              <p className="secure-badge">
                <ShieldCheck size={14} /> THANH TOÁN AN TOÀN & BẢO MẬT
              </p>
            </div>

            {/* Warm reflection card */}
            <div className="warm-quote-card">
              <p>
                "Thời gian là một dòng chảy không ngừng. Chúng tôi mong bạn tìm thấy sự bình yên trong từng trang sách này."
              </p>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .cart-header {
          padding-top: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 40px;
        }
        .cart-title {
          font-size: 2.8rem;
          font-weight: 400;
          margin-bottom: 8px;
        }
        .cart-subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--color-text-muted);
          font-size: 1.15rem;
          line-height: 1.6;
          border-left: 2px solid var(--color-accent);
          padding-left: 16px;
        }

        .cart-auth-prompt, .empty-cart-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
          border: 1px dashed var(--border-color-dark);
          background-color: var(--bg-secondary);
        }
        .cart-auth-prompt h2, .empty-cart-view h2 {
          font-size: 1.8rem;
          margin-top: 16px;
          margin-bottom: 8px;
        }
        .cart-auth-prompt p, .empty-cart-view p {
          color: var(--color-text-muted);
          font-size: 0.95rem;
        }

        .cart-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
        }

        .cart-layout-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 48px;
          align-items: start;
        }

        /* Cart Items Column */
        .cart-items-column {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .items-list-container {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid var(--border-color);
        }
        .cart-item-card {
          display: flex;
          gap: 24px;
          padding: 24px 0;
          border-top: 1px solid var(--border-color);
          align-items: center;
        }
        .item-cover-link {
          width: 90px;
          aspect-ratio: 3 / 4;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          flex-shrink: 0;
        }
        .item-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-info-pane {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .item-title {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--color-text-main);
          line-height: 1.25;
        }
        .item-details-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        .item-qty-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 12px;
        }
        
        .qty-picker {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color-dark);
          background-color: white;
          border-radius: 2px;
          height: 32px;
        }
        .qty-picker-btn {
          width: 32px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        .qty-picker-btn:disabled {
          opacity: 0.3;
        }
        .qty-picker-val {
          width: 32px;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .item-remove-btn {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          border-bottom: 1px dashed var(--color-text-muted);
          padding-bottom: 2px;
        }
        .item-remove-btn:hover {
          color: #A34E36;
          border-color: #A34E36;
        }

        .item-price-pane {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }
        .item-final-price {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-accent);
        }
        .item-discount-savings {
          font-size: 0.75rem;
          color: #438258;
          font-weight: 500;
        }

        .eco-friendly-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px;
          background-color: #F0F7F2;
          border: 1px solid #D6EADF;
          font-size: 0.85rem;
          color: #2E5C3E;
        }
        
        .editorial-philosophy-card {
          border-left: 2px solid var(--color-accent);
          padding-left: 24px;
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .editorial-philosophy-card p {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 1.15rem;
          line-height: 1.6;
          color: var(--color-text-muted);
        }
        .editorial-philosophy-card span {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--color-text-main);
        }

        /* Cart Summary Column */
        .cart-summary-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: sticky;
          top: 104px;
        }
        .summary-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 32px;
          box-shadow: var(--shadow-sm);
        }
        .summary-title {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color-dark);
          padding-bottom: 10px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: var(--color-text-muted);
          margin-bottom: 16px;
        }
        .summary-row.discount {
          color: #438258;
          font-weight: 500;
        }
        .shipping-free {
          color: var(--color-text-main);
          font-weight: 500;
        }
        .summary-divider {
          border: 0;
          border-top: 1px solid var(--border-color);
          margin: 20px 0;
        }
        .summary-row.total {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--color-accent);
          margin-bottom: 24px;
        }
        
        .summary-notes-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .summary-notes-field label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          color: var(--color-text-main);
        }
        .summary-notes-field textarea {
          background-color: white;
          border-color: var(--border-color-dark);
          font-size: 0.85rem;
          resize: none;
        }

        .checkout-cta-btn {
          width: 100%;
          background-color: #555845; /* Olive green matching "Tiếp tục thanh toán" mockup button */
          color: white;
          padding: 16px;
          font-weight: 600;
          font-size: 1rem;
          text-align: center;
          border-radius: 2px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 16px;
        }
        .checkout-cta-btn:hover {
          background-color: #434536;
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        
        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          letter-spacing: 0.05em;
        }

        .warm-quote-card {
          border: 1px solid var(--border-color);
          padding: 24px;
          background-color: var(--bg-primary);
          text-align: center;
        }
        .warm-quote-card p {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 0.95rem;
          color: var(--color-text-muted);
          line-height: 1.6;
        }

        @media (max-width: 992px) {
          .cart-layout-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .cart-summary-column {
            position: relative;
            top: 0;
          }
        }
      `}} />
    </div>
  );
};

export default CartPage;
