import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CreditCard, Truck, MapPin, ClipboardList, CheckCircle2, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderAPI, paymentAPI, authAPI } from "../services/api";
import { formatPrice } from "../components/ComicCard";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, totalAmount, clearCart, fetchCart } = useCart();
  
  // Retrieve note from cart page state
  const initialNote = location.state?.orderNote || "";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState(initialNote);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [sepayBankName, setSepayBankName] = useState("vietcombank");
  const [sepayAccountNo, setSepayAccountNo] = useState("0123456789");
  const [sepayAccountName, setSepayAccountName] = useState("NGUYEN VIET HIEU");

  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Fetch SePay configuration from backend on mount
  React.useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const res = await paymentAPI.getConfig();
        if (res.success) {
          setSepayBankName(res.data.bankName);
          setSepayAccountNo(res.data.accountNo);
          setSepayAccountName(res.data.accountName);
        }
      } catch (err) {
        console.error("Lỗi lấy cấu hình thanh toán:", err);
      }
    };
    fetchPaymentConfig();
  }, []);

  // Fetch saved addresses if logged in
  React.useEffect(() => {
    if (user) {
      const fetchAddresses = async () => {
        try {
          const res = await authAPI.getAddresses();
          if (res.success && res.data.length > 0) {
            setSavedAddresses(res.data);
            const defaultAddr = res.data.find(addr => addr.isDefault) || res.data[0];
            if (defaultAddr) {
              setName(defaultAddr.name);
              setPhone(defaultAddr.phone);
              setAddress(defaultAddr.address);
              setCity(defaultAddr.city);
            }
          }
        } catch (err) {
          console.error("Lỗi lấy sổ địa chỉ:", err);
        }
      };
      fetchAddresses();
    }
  }, [user]);

  // Polling loop inside a useEffect that triggers when placedOrder is set
  React.useEffect(() => {
    let intervalId;
    if (placedOrder && paymentMethod === "ONLINE" && !paymentSuccess) {
      intervalId = setInterval(async () => {
        try {
          const res = await orderAPI.getOrderById(placedOrder._id);
          if (res.success) {
            const ord = res.data;
            if (ord.paymentStatus === "paid" || ord.status === "confirmed") {
              setPaymentSuccess(true);
              clearInterval(intervalId);
              
              // Clear cart in state
              await clearCart();
              await fetchCart();
              
              // Auto-redirect to order details after 3 seconds
              setTimeout(() => {
                navigate(`/order/${placedOrder._id}`, { state: { newOrderSuccess: true } });
              }, 3000);
            }
          }
        } catch (err) {
          console.error("Polling order error:", err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [placedOrder, paymentMethod, paymentSuccess, clearCart, fetchCart, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address || !city) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin giao hàng.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const orderData = {
        shippingAddress: {
          name,
          phone,
          address,
          city,
        },
        note,
        paymentMethod,
      };

      const res = await orderAPI.createOrder(orderData);
      if (res.success) {
        // Clear local cart
        await clearCart();
        // Refresh cart context
        await fetchCart();

        if (paymentMethod === "ONLINE") {
          // Keep screen here and open SePay VietQR Modal
          setPlacedOrder(res.data);
        } else {
          // COD: Redirect directly to order details to track
          navigate(`/order/${res.data._id}`, { state: { newOrderSuccess: true } });
        }
      } else {
        setErrorMessage(res.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Submit order error:", err);
      setErrorMessage(err.response?.data?.message || "Đặt hàng thất bại do lỗi hệ thống.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!placedOrder && (!cart || cart.items.length === 0)) {
    return (
      <div className="container checkout-empty-state animate-fade-in">
        <ClipboardList size={48} color="var(--color-text-muted)" />
        <h2>Không có sản phẩm để thanh toán</h2>
        <p>Vui lòng chọn mua tác phẩm trước khi thực hiện thanh toán.</p>
        <Link to="/collection" className="btn-primary" style={{ marginTop: "24px" }}>
          Đến bộ sưu tập truyện
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper container animate-fade-in">
      <div className="checkout-header">
        <h1 className="checkout-title">Thủ tục thanh toán</h1>
        <p className="checkout-subtitle">"Hoàn tất đơn hàng để nhận sách trong thời gian sớm nhất."</p>
      </div>

      {errorMessage && (
        <div className="checkout-error-banner animate-fade-in">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="checkout-form-layout">
        {/* Left Column: Form Details */}
        <div className="checkout-details-pane">
          {/* Shipping Address Section */}
          <div className="checkout-section-card">
            <h3 className="section-card-title">
              <MapPin size={18} /> Thông tin giao hàng
            </h3>
            
            {savedAddresses.length > 0 && (
              <div className="saved-addresses-selector-checkout" style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#FAF5EE", border: "1px solid var(--border-color-dark)" }}>
                <label style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "600", color: "var(--color-text-main)", display: "block", marginBottom: "10px" }}>
                  Chọn nhanh từ Sổ địa chỉ
                </label>
                <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                  {savedAddresses.map((addr) => {
                    const isSelected = name === addr.name && phone === addr.phone && address === addr.address && city === addr.city;
                    return (
                      <button
                        key={addr._id}
                        type="button"
                        onClick={() => {
                          setName(addr.name);
                          setPhone(addr.phone);
                          setAddress(addr.address);
                          setCity(addr.city);
                        }}
                        style={{
                          padding: "12px",
                          backgroundColor: "white",
                          border: isSelected ? "2px solid var(--color-accent)" : "1px solid var(--border-color-dark)",
                          textAlign: "left",
                          fontSize: "0.85rem",
                          flexShrink: 0,
                          cursor: "pointer",
                          minWidth: "200px",
                          boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                          transition: "var(--transition)"
                        }}
                      >
                        <strong style={{ display: "block", color: "var(--color-text-main)" }}>
                          {addr.name} {addr.isDefault && <span style={{ color: "var(--color-accent)", fontSize: "0.7rem", fontWeight: "600" }}>(Mặc định)</span>}
                        </strong>
                        <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: "0.75rem", marginTop: "4px" }}>SĐT: {addr.phone}</span>
                        <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: "0.75rem" }}>{addr.address}, {addr.city}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="form-group-grid">
              <div className="form-input-wrapper">
                <label htmlFor="full-name">Họ và tên người nhận *</label>
                <input
                  type="text"
                  id="full-name"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-wrapper">
                <label htmlFor="phone-number">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phone-number"
                  placeholder="Ví dụ: 0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-input-wrapper" style={{ marginTop: "16px" }}>
              <label htmlFor="address-detail">Địa chỉ giao hàng (Số nhà, tên đường...) *</label>
              <input
                type="text"
                id="address-detail"
                placeholder="Ví dụ: 12 Đường số 3, Linh Trung"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-input-wrapper" style={{ marginTop: "16px" }}>
              <label htmlFor="city-region">Tỉnh / Thành phố *</label>
              <input
                type="text"
                id="city-region"
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            
            <div className="form-input-wrapper" style={{ marginTop: "16px" }}>
              <label htmlFor="order-note-checkout">Ghi chú giao hàng (không bắt buộc)</label>
              <textarea
                id="order-note-checkout"
                rows="3"
                placeholder="Lời nhắn gửi cho tài xế giao hàng..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="checkout-section-card" style={{ marginTop: "24px" }}>
            <h3 className="section-card-title">
              <CreditCard size={18} /> Phương thức thanh toán
            </h3>

            <div className="payment-options-grid">
              <label className={`payment-option-label ${paymentMethod === "COD" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <span className="payment-icon"><Truck size={20} /></span>
                <div className="payment-desc">
                  <strong>Thanh toán COD</strong>
                  <p>Thanh toán bằng tiền mặt khi nhận hàng.</p>
                </div>
              </label>

              <label className={`payment-option-label ${paymentMethod === "ONLINE" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                />
                <span className="payment-icon"><CreditCard size={20} /></span>
                <div className="payment-desc">
                  <strong>Thanh toán trực tuyến</strong>
                  <p>Mô phỏng thanh toán trực tuyến bảo mật.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div className="checkout-summary-pane">
          <div className="summary-sticky-card">
            <h3 className="summary-title">Đơn hàng của bạn</h3>
            
            <div className="review-items-list">
              {cart?.items?.map((item) => {
                if (!item.comic) return null;
                const { _id, title, price, discount = 0, images = [] } = item.comic;
                const finalPrice = price * (1 - discount / 100);
                const cover = images[0] || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=60";
                
                return (
                  <div key={_id} className="review-item-card">
                    <img src={cover} alt={title} className="review-item-img" />
                    <div className="review-item-info">
                      <p className="review-item-title">{title}</p>
                      <p className="review-item-qty">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="review-item-price">{formatPrice(finalPrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <hr className="summary-divider" />

            <div className="review-total-row">
              <span>Thành tiền</span>
              <span className="grand-total-val">{formatPrice(totalAmount)}</span>
            </div>
            
            <div className="shipping-notice">
              <CheckCircle2 size={14} color="#438258" />
              <span>Đơn hàng của bạn đủ điều kiện được <strong>miễn phí giao hàng</strong>.</span>
            </div>

            <button
              type="submit"
              className="place-order-cta-btn"
              disabled={submitting}
            >
              {submitting ? "Đang xử lý..." : "Đặt hàng ngay"}
            </button>
            
            <Link to="/cart" className="back-to-cart-link">
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{__html: `
        .checkout-header {
          padding-top: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 40px;
        }
        .checkout-title {
          font-size: 2.8rem;
          font-weight: 400;
          margin-bottom: 8px;
        }
        .checkout-subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--color-text-muted);
          font-size: 1.15rem;
          line-height: 1.6;
          border-left: 2px solid var(--color-accent);
          padding-left: 16px;
        }
        
        .checkout-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
          border: 1px dashed var(--border-color-dark);
          background-color: var(--bg-secondary);
        }

        .checkout-error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #FDF2F0;
          border: 1px solid #F3C4B8;
          color: #A34E36;
          padding: 14px 20px;
          margin-bottom: 32px;
          font-size: 0.9rem;
        }

        .checkout-form-layout {
          display: grid;
          grid-template-columns: 1.40fr 1fr;
          gap: 48px;
          align-items: start;
        }

        /* Forms Pane */
        .checkout-section-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 32px;
          box-shadow: var(--shadow-sm);
        }
        .section-card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-serif);
          font-size: 1.6rem;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color-dark);
          padding-bottom: 10px;
          color: var(--color-accent);
        }

        .form-group-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .form-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-input-wrapper label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          color: var(--color-text-main);
        }
        .form-input-wrapper input, .form-input-wrapper textarea {
          background-color: white;
          border-color: var(--border-color-dark);
          font-size: 0.9rem;
        }

        /* Payment Options */
        .payment-options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .payment-option-label {
          border: 1px solid var(--border-color-dark);
          padding: 20px;
          background-color: white;
          display: flex;
          gap: 12px;
          cursor: pointer;
          transition: var(--transition);
        }
        .payment-option-label input {
          display: none;
        }
        .payment-option-label:hover {
          border-color: var(--color-accent);
        }
        .payment-option-label.active {
          border-color: var(--color-accent);
          background-color: var(--color-accent-light);
        }
        .payment-icon {
          color: var(--color-accent);
        }
        .payment-desc strong {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }
        .payment-desc p {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        /* Order Review Summary */
        .checkout-summary-pane {
          position: sticky;
          top: 104px;
        }
        .summary-sticky-card {
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
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
        
        .review-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 320px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .review-item-card {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .review-item-img {
          width: 50px;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          border: 1px solid var(--border-color);
        }
        .review-item-info {
          flex: 1;
        }
        .review-item-title {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-text-main);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .review-item-qty {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .review-item-price {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-main);
        }

        .summary-divider {
          border: 0;
          border-top: 1px solid var(--border-color-dark);
          margin: 20px 0;
        }
        .review-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .review-total-row span {
          font-size: 1.15rem;
          font-weight: 600;
        }
        .grand-total-val {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--color-accent) !important;
        }

        .shipping-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #F0F7F2;
          border: 1px solid #D6EADF;
          padding: 12px;
          font-size: 0.8rem;
          color: #2E5C3E;
          margin-bottom: 24px;
        }
        
        .place-order-cta-btn {
          width: 100%;
          background-color: var(--color-accent);
          color: white;
          padding: 16px;
          font-weight: 600;
          font-size: 1rem;
          text-align: center;
          border-radius: 2px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 16px;
        }
        .place-order-cta-btn:hover {
          background-color: var(--color-accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .place-order-cta-btn:disabled {
          background-color: var(--border-color-dark);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .back-to-cart-link {
          display: block;
          text-align: center;
          font-size: 0.85rem;
          color: var(--color-text-muted);
          border-bottom: 1px dashed var(--color-text-muted);
          width: fit-content;
          margin: 0 auto;
          padding-bottom: 2px;
        }
        .back-to-cart-link:hover {
          color: var(--color-accent);
          border-color: var(--color-accent);
        }

        /* SePay Modal Styles */
        .sepay-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          animation: fadeIn 0.25s ease-out;
        }
        .sepay-modal {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          width: 100%;
          max-width: 640px;
          padding: 40px;
          box-shadow: var(--shadow-lg);
          max-height: 90vh;
          overflow-y: auto;
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .sepay-modal-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .sepay-modal-header h2 {
          font-family: var(--font-serif);
          font-size: 2rem;
          color: var(--color-accent);
          margin-bottom: 8px;
        }
        .sepay-modal-header p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .sepay-qr-container {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 28px;
          align-items: center;
          background-color: white;
          border: 1px solid var(--border-color-dark);
          padding: 24px;
          margin-bottom: 24px;
        }
        .sepay-qr-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: contain;
          border: 1px solid var(--border-color);
        }
        .sepay-qr-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 6px;
        }
        .detail-item strong {
          color: var(--color-text-main);
        }
        .detail-item .text-accent {
          color: var(--color-accent);
          font-size: 1.1rem;
        }
        .detail-item.highlight {
          background-color: var(--bg-primary);
          padding: 10px;
          border: 1px solid var(--border-color-dark);
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-start;
          border-bottom: none;
        }
        .detail-item.highlight span {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }
        .detail-item.highlight strong.text-code {
          font-size: 1.25rem;
          color: var(--color-accent);
          font-family: monospace;
          letter-spacing: 0.05em;
        }

        .sepay-status-checker {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background-color: #FBF7F0;
          border: 1px solid var(--border-color-dark);
          padding: 14px;
          font-size: 0.85rem;
          color: var(--color-text-main);
          margin-bottom: 24px;
        }
        
        .spinner-green {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(108, 61, 47, 0.2);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 1s infinite linear;
        }

        .sepay-modal-footer {
          text-align: center;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          border-top: 1px dashed var(--border-color-dark);
          padding-top: 20px;
        }
        
        .btn-group-modal {
          margin-top: 16px;
        }
        
        .btn-manual-confirm {
          background-color: transparent;
          color: var(--color-text-muted);
          border: 1px solid var(--border-color-dark);
          padding: 10px 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .btn-manual-confirm:hover {
          color: var(--color-accent);
          border-color: var(--color-accent);
        }

        /* Success state inside modal */
        .sepay-success-state {
          text-align: center;
          padding: 20px 0;
        }
        .success-checkmark-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .success-checkmark-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: #438258;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(67, 130, 88, 0.3);
        }
        .sepay-success-state h2 {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          color: #438258;
          margin-bottom: 12px;
        }
        .sepay-success-state p {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          margin-bottom: 24px;
        }
        .order-details-summary {
          display: inline-flex;
          flex-direction: column;
          gap: 6px;
          background-color: white;
          border: 1px solid var(--border-color-dark);
          padding: 16px 28px;
          font-size: 0.9rem;
          margin-bottom: 32px;
        }
        .order-details-summary strong {
          color: var(--color-text-main);
        }
        .success-redirect-msg {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 992px) {
          .checkout-form-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .checkout-summary-pane {
            position: relative;
            top: 0;
          }
        }
        @media (max-width: 576px) {
          .form-group-grid {
            grid-template-columns: 1fr;
          }
          .payment-options-grid {
            grid-template-columns: 1fr;
          }
          .sepay-qr-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}} />

      {placedOrder && paymentMethod === "ONLINE" && (
        <div className="sepay-modal-overlay">
          <div className="sepay-modal animate-scale-up">
            {!paymentSuccess ? (
              <>
                <div className="sepay-modal-header">
                  <h2>Thanh toán trực tuyến VietQR</h2>
                  <p>Vui lòng quét mã QR chuyển khoản bằng ứng dụng ngân hàng để hoàn tất đơn hàng.</p>
                </div>
                
                <div className="sepay-qr-container">
                  <img
                    src={`https://img.vietqr.io/image/${sepayBankName}-${sepayAccountNo}-compact2.png?amount=${placedOrder.totalAmount}&addInfo=KOM${placedOrder._id.slice(-6).toUpperCase()}&accountName=${encodeURIComponent(sepayAccountName)}`}
                    alt="VietQR SePay"
                    className="sepay-qr-image"
                  />
                  <div className="sepay-qr-details">
                    <div className="detail-item">
                      <span>Ngân hàng:</span>
                      <strong>{sepayBankName.toUpperCase()}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Số tài khoản:</span>
                      <strong>{sepayAccountNo}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Tên tài khoản:</span>
                      <strong>{sepayAccountName}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Số tiền:</span>
                      <strong className="text-accent">{formatPrice(placedOrder.totalAmount)}</strong>
                    </div>
                    <div className="detail-item highlight">
                      <span>Nội dung CK:</span>
                      <strong className="text-code">KOM{placedOrder._id.slice(-6).toUpperCase()}</strong>
                    </div>
                  </div>
                </div>

                <div className="sepay-status-checker">
                  <div className="spinner-green"></div>
                  <span>Đang lắng nghe tự động giao dịch ngân hàng...</span>
                </div>

                <div className="sepay-modal-footer">
                  <p>Hệ thống sẽ tự động phát hiện chuyển khoản và duyệt đơn sau 5-15 giây.</p>
                  <div className="btn-group-modal">
                    <button
                      onClick={() => navigate("/profile", { state: { newOrderSuccess: true } })}
                      className="btn-manual-confirm"
                    >
                      Tôi sẽ thanh toán sau / Xem đơn hàng
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="sepay-success-state animate-scale-up">
                <div className="success-checkmark-wrapper">
                  <div className="success-checkmark-circle">
                    <CheckCircle2 size={64} color="white" />
                  </div>
                </div>
                <h2>Thanh toán thành công!</h2>
                <p>Komorebi Manga đã nhận được khoản thanh toán từ bạn.</p>
                <div className="order-details-summary">
                  <span>Mã đơn hàng: <strong>KOM-{placedOrder._id.slice(-6).toUpperCase()}</strong></span>
                  <span>Tổng thanh toán: <strong>{formatPrice(placedOrder.totalAmount)}</strong></span>
                </div>
                <div className="success-redirect-msg">
                  <div className="spinner-green"></div>
                  <span>Đang di chuyển bạn đến trang quản lý lịch sử đơn hàng...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
