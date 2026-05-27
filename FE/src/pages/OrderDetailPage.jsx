import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import { formatPrice } from "../components/ComicCard";
import {
  Clock,
  ClipboardList,
  MapPin,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ShoppingBag,
  CreditCard
} from "lucide-react";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrderById(id);
      if (res.success) {
        setOrder(res.data);
      } else {
        setError(res.message || "Không thể tải thông tin đơn hàng.");
      }
    } catch (err) {
      console.error("Fetch order detail error:", err);
      setError("Đơn hàng không tồn tại hoặc lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const handleCancelOrder = async () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      setCancelLoading(true);
      try {
        const res = await orderAPI.cancelOrder(order._id);
        if (res.success) {
          setToastMessage({ type: "success", text: res.message || "Hủy đơn hàng thành công!" });
          setOrder({ ...order, ...res.data });
        } else {
          setToastMessage({ type: "error", text: res.message || "Hủy đơn hàng thất bại." });
        }
      } catch (err) {
        console.error("Cancel order error:", err);
        setToastMessage({ type: "error", text: err.response?.data?.message || "Lỗi khi hủy đơn hàng." });
      } finally {
        setCancelLoading(false);
        setTimeout(() => setToastMessage(null), 4000);
      }
    }
  };

  if (loading) {
    return (
      <div className="container order-detail-loading animate-fade-in">
        <div className="spinner"></div>
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container order-detail-error animate-fade-in">
        <AlertTriangle size={48} color="#A34E36" />
        <h2>Đã xảy ra lỗi</h2>
        <p>{error || "Không tìm thấy đơn hàng này."}</p>
        <Link to="/profile" className="btn-primary" style={{ marginTop: "24px" }}>
          Quay lại trang cá nhân
        </Link>
      </div>
    );
  }

  // Helpers for Status
  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Chờ xác nhận";
      case "confirmed": return "Đã xác nhận";
      case "preparing": return "Đang đóng gói";
      case "shipping": return "Đang vận chuyển";
      case "delivered": return "Đã giao hàng";
      case "cancelled": return "Đã hủy";
      default: return "Chờ xử lý";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending": return "badge-pending";
      case "confirmed":
      case "preparing": return "badge-preparing";
      case "shipping": return "badge-shipping";
      case "delivered": return "badge-delivered";
      case "cancelled": return "badge-cancelled";
      default: return "";
    }
  };

  const isDirectCancellable = () => {
    return order?.isDirectCancellable === true;
  };

  const isCancelRequestable = () => {
    return order?.isCancelRequestable === true;
  };

  const dateStr = new Date(order.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="order-detail-page container animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`toast-alert-profile ${toastMessage.type} animate-fade-in`}>
          {toastMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Breadcrumb Back */}
      <div className="order-detail-header-nav">
        <button className="back-to-profile-btn" onClick={() => navigate("/profile")}>
          <ArrowLeft size={16} /> Trở về trang cá nhân
        </button>
      </div>

      <div className="order-detail-header">
        <div>
          <h1 className="order-detail-title">Đơn hàng KOM-{order._id.slice(-6).toUpperCase()}</h1>
          <p className="order-detail-subtitle">
            <Clock size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Đặt ngày {dateStr}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className={`status-badge ${getStatusBadgeClass(order.status)}`} style={{ fontSize: "0.95rem", padding: "8px 16px" }}>
            {getStatusText(order.status)}
          </span>
          {order.cancelRequest && (
            <span className="status-badge badge-pending-cancel" style={{ fontSize: "0.95rem", padding: "8px 16px" }}>
              Đang chờ duyệt hủy
            </span>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="order-detail-grid">
        {/* Left Column: Stepper and Address */}
        <div className="order-detail-left-pane">
          {/* Tracking Stepper Card */}
          <div className="detail-section-card">
            <h3 className="section-card-title">
              <Truck size={18} /> Trạng thái vận chuyển
            </h3>

            <div className="detail-stepper-box">
              {order.status === "cancelled" ? (
                <div className="stepper-cancelled animate-fade-in">
                  <XCircle size={48} color="#A34E36" />
                  <h4>Đơn hàng đã bị hủy</h4>
                  <p>Kho hàng đã hoàn trả lại tồn kho của sản phẩm.</p>
                </div>
              ) : (
                <div className="detail-stepper-steps">
                  <div className={`step-item ${["pending", "confirmed", "preparing", "shipping", "delivered"].includes(order.status) ? "active" : ""}`}>
                    <div className="step-number">{["confirmed", "preparing", "shipping", "delivered"].includes(order.status) ? "✓" : "1"}</div>
                    <span className="step-label">Chờ xác nhận</span>
                  </div>

                  <div className={`step-connector ${["confirmed", "preparing", "shipping", "delivered"].includes(order.status) ? "active" : ""}`}></div>

                  <div className={`step-item ${["confirmed", "preparing", "shipping", "delivered"].includes(order.status) ? "active" : ""}`}>
                    <div className="step-number">{["shipping", "delivered"].includes(order.status) ? "✓" : "2"}</div>
                    <span className="step-label">Đang đóng gói</span>
                  </div>

                  <div className={`step-connector ${["shipping", "delivered"].includes(order.status) ? "active" : ""}`}></div>

                  <div className={`step-item ${["shipping", "delivered"].includes(order.status) ? "active" : ""}`}>
                    <div className="step-number">{["delivered"].includes(order.status) ? "✓" : "3"}</div>
                    <span className="step-label">Đang giao hàng</span>
                  </div>

                  <div className={`step-connector ${["delivered"].includes(order.status) ? "active" : ""}`}></div>

                  <div className={`step-item ${order.status === "delivered" ? "active" : ""}`}>
                    <div className="step-number">4</div>
                    <span className="step-label">Đã giao hàng</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Payment details */}
          <div className="order-detail-info-grid" style={{ marginTop: "24px" }}>
            <div className="detail-section-card">
              <h3 className="section-card-title">
                <MapPin size={18} /> Địa chỉ giao nhận
              </h3>
              <div className="address-text-block">
                <strong>{order.shippingAddress?.name || "Người nhận"}</strong>
                <p>Số điện thoại: {order.shippingAddress?.phone || "N/A"}</p>
                <p>Địa chỉ: {order.shippingAddress?.address || "N/A"}, {order.shippingAddress?.city || ""}</p>
                {order.note && (
                  <p className="note-text">Ghi chú: "{order.note}"</p>
                )}
              </div>
            </div>

            <div className="detail-section-card">
              <h3 className="section-card-title">
                <CreditCard size={18} /> Thanh toán
              </h3>
              <div className="payment-text-block">
                <p>Phương thức: <strong>{order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán VietQR Trực tuyến"}</strong></p>
                <p>Trạng thái: <strong style={{ color: order.paymentStatus === "paid" ? "#438258" : "#A34E36" }}>
                  {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                </strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Items and Totals */}
        <div className="order-detail-right-pane">
          <div className="detail-section-card">
            <h3 className="section-card-title">
              <ShoppingBag size={18} /> Chi tiết sản phẩm ({order.items.length})
            </h3>

            <div className="order-detail-items-list">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-detail-item-row">
                  <img src={item.image} alt={item.title} className="order-detail-item-thumb" />
                  <div className="order-detail-item-info">
                    <p className="order-detail-item-title">{item.title}</p>
                    <p className="order-detail-item-qty">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="order-detail-item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <hr className="summary-divider" style={{ margin: "20px 0" }} />

            <div className="pricing-rows-summary">
              <div className="pricing-row-item">
                <span>Tạm tính</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="pricing-row-item">
                <span>Phí vận chuyển</span>
                <span className="free">Miễn phí</span>
              </div>
              <hr className="summary-divider" style={{ borderStyle: "dashed" }} />
              <div className="pricing-row-item grand-total-row">
                <span>Tổng cộng</span>
                <span className="total-val">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Cancel Action buttons */}
            <div className="order-detail-actions-pane" style={{ marginTop: "24px" }}>
              {isDirectCancellable() && (
                <button
                  className="place-order-cta-btn cancel-btn"
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                  style={{ backgroundColor: "#A34E36" }}
                >
                  {cancelLoading ? "Đang xử lý..." : "Hủy đơn hàng ngay"}
                </button>
              )}

              {isCancelRequestable() && (
                <button
                  className="place-order-cta-btn cancel-btn"
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                  style={{ backgroundColor: "var(--color-text-main)" }}
                >
                  {cancelLoading ? "Đang gửi..." : "Gửi yêu cầu hủy đơn"}
                </button>
              )}

              {order.cancelRequest && (
                <div className="shipping-notice" style={{ backgroundColor: "#FDF2F0", border: "1px solid #F3C4B8", color: "#A34E36", display: "flex", gap: "8px", margin: 0 }}>
                  <AlertTriangle size={14} />
                  <span>Yêu cầu hủy của bạn đang chờ quản trị viên xét duyệt.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .order-detail-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 0;
          gap: 16px;
        }

        .order-detail-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
        }

        .order-detail-header-nav {
          margin-top: 32px;
          margin-bottom: 16px;
        }
        .back-to-profile-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: var(--transition);
          padding: 0;
        }
        .back-to-profile-btn:hover {
          color: var(--color-accent);
        }

        .order-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .order-detail-title {
          font-size: 2.4rem;
          font-weight: 400;
          margin-bottom: 8px;
        }
        .order-detail-subtitle {
          color: var(--color-text-muted);
          font-size: 0.95rem;
        }

        .order-detail-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .detail-section-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 32px;
          box-shadow: var(--shadow-sm);
        }

        .detail-stepper-box {
          padding: 16px 0;
        }

        .detail-stepper-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        .detail-stepper-steps .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 2;
          width: 80px;
        }
        .detail-stepper-steps .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--border-color-dark);
          background-color: white;
          color: var(--color-text-muted);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: var(--transition);
        }
        .detail-stepper-steps .step-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-align: center;
          font-weight: 500;
        }
        
        .detail-stepper-steps .step-item.active .step-number {
          border-color: var(--color-accent);
          background-color: var(--color-accent);
          color: white;
          box-shadow: 0 0 0 4px var(--color-accent-light);
        }
        .detail-stepper-steps .step-item.active .step-label {
          color: var(--color-accent);
          font-weight: 600;
        }

        .detail-stepper-steps .step-connector {
          flex: 1;
          height: 2px;
          background-color: var(--border-color-dark);
          margin-top: -26px; /* align with numbers */
          z-index: 1;
        }
        .detail-stepper-steps .step-connector.active {
          background-color: var(--color-accent);
        }

        .stepper-cancelled {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px 0;
          gap: 10px;
        }
        .stepper-cancelled h4 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: #A34E36;
        }
        .stepper-cancelled p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .order-detail-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .address-text-block strong, .payment-text-block strong {
          display: block;
          font-size: 1rem;
          margin-bottom: 8px;
        }
        .address-text-block p, .payment-text-block p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          line-height: 1.6;
          margin: 4px 0;
        }
        .address-text-block .note-text {
          font-style: italic;
          color: var(--color-accent);
          margin-top: 10px;
          background-color: var(--bg-primary);
          padding: 8px 12px;
          border-left: 2px solid var(--color-accent);
        }

        .order-detail-items-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 16px;
        }
        .order-detail-item-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .order-detail-item-thumb {
          width: 50px;
          aspect-ratio: 3/4;
          object-fit: cover;
          border: 1px solid var(--border-color);
        }
        .order-detail-item-info {
          flex: 1;
        }
        .order-detail-item-title {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-main);
          margin-bottom: 4px;
        }
        .order-detail-item-qty {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .order-detail-item-price {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-main);
        }

        .pricing-rows-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pricing-row-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--color-text-muted);
        }
        .pricing-row-item.grand-total-row {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-text-main);
          margin-top: 8px;
        }
        .pricing-row-item .total-val {
          font-size: 1.5rem;
          color: var(--color-accent) !important;
          font-weight: 700;
        }
        .pricing-row-item .free {
          color: #438258;
          font-weight: 500;
        }

        @media (max-width: 992px) {
          .order-detail-grid {
            grid-template-columns: 1fr;
          }
          .order-detail-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </div>
  );
};

export default OrderDetailPage;
