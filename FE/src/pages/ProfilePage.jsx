import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderAPI, authAPI } from "../services/api";
import { formatPrice } from "../components/ComicCard";
import { Editor } from "@tinymce/tinymce-react";
import {
  Clock,
  ClipboardList,
  MapPin,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  User as UserIcon,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Camera
} from "lucide-react";

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const location = newLocation => {}; // mock/unused, using React Router location
  const routerLocation = useLocation();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  // Navigation tab state: "orders", "edit-profile", "addresses"
  const [activeTab, setActiveTab] = useState(tabParam || "orders");
  
  // Orders history state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileBio, setProfileBio] = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Address book state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // Address form fields
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrValue, setAddrValue] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // General Notification toast
  const [toastMessage, setToastMessage] = useState(null);

  const newOrderSuccess = routerLocation.state?.newOrderSuccess;

  // Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await orderAPI.getOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await authAPI.getAddresses();
      if (res.success) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.error("Fetch addresses error:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchAddresses();
      setProfileName(user.name || "");
      setProfileBio(user.bio || "");
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (newOrderSuccess) {
      setToastMessage({ type: "success", text: "Đơn hàng của bạn đã được đặt thành công!" });
      setTimeout(() => setToastMessage(null), 5000);
    }
  }, [newOrderSuccess]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setToastMessage({ type: "error", text: "Tên hiển thị không được bỏ trống." });
      return;
    }

    setProfileSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", profileName);
      formData.append("bio", profileBio);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await authAPI.updateProfile(formData);
      if (res.success) {
        setUser(res.data.user);
        setShowSuccessModal(true);
      } else {
        setToastMessage({ type: "error", text: res.message || "Cập nhật hồ sơ thất bại." });
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setToastMessage({ type: "error", text: err.response?.data?.message || "Lỗi khi cập nhật hồ sơ." });
    } finally {
      setProfileSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Avatar file input change handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Address operations
  const openNewAddressForm = () => {
    setEditingAddress(null);
    setAddrName("");
    setAddrPhone("");
    setAddrValue("");
    setAddrCity("");
    setAddrIsDefault(addresses.length === 0); // Default if first
    setShowAddressForm(true);
  };

  const openEditAddressForm = (addr) => {
    setEditingAddress(addr);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrValue(addr.address);
    setAddrCity(addr.city);
    setAddrIsDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrValue || !addrCity) {
      setToastMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin địa chỉ." });
      return;
    }

    setAddressSubmitting(true);
    try {
      const addressData = {
        name: addrName,
        phone: addrPhone,
        address: addrValue,
        city: addrCity,
        isDefault: addrIsDefault
      };

      let res;
      if (editingAddress) {
        res = await authAPI.updateAddress(editingAddress._id, addressData);
      } else {
        res = await authAPI.addAddress(addressData);
      }

      if (res.success) {
        setAddresses(res.data);
        setShowAddressForm(false);
        setToastMessage({
          type: "success",
          text: editingAddress ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ mới thành công!"
        });
      }
    } catch (err) {
      console.error("Address operation error:", err);
      setToastMessage({ type: "error", text: err.response?.data?.message || "Lỗi lưu địa chỉ." });
    } finally {
      setAddressSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      try {
        const res = await authAPI.deleteAddress(addressId);
        if (res.success) {
          setAddresses(res.data);
          setToastMessage({ type: "success", text: "Xóa địa chỉ thành công!" });
        }
      } catch (err) {
        console.error("Delete address error:", err);
        setToastMessage({ type: "error", text: "Lỗi khi xóa địa chỉ." });
      } finally {
        setTimeout(() => setToastMessage(null), 4000);
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await authAPI.setDefaultAddress(addressId);
      if (res.success) {
        setAddresses(res.data);
        setToastMessage({ type: "success", text: "Đã đặt làm địa chỉ mặc định!" });
      }
    } catch (err) {
      console.error("Set default address error:", err);
      setToastMessage({ type: "error", text: "Lỗi cài đặt địa chỉ mặc định." });
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Order cancellation handler
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      setCancelLoading(true);
      try {
        const res = await orderAPI.cancelOrder(orderId);
        if (res.success) {
          setToastMessage({ type: "success", text: res.message || "Hủy đơn hàng thành công!" });
          fetchOrders();
          if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder({ ...selectedOrder, ...res.data });
          }
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

  if (!user) {
    return (
      <div className="container profile-auth-prompt animate-fade-in">
        <ClipboardList size={48} color="var(--color-text-muted)" />
        <h2>Hồ sơ của bạn</h2>
        <p>Vui lòng đăng nhập để xem thông tin cá nhân và lịch sử mua hàng.</p>
        <Link to="/login?redirect=profile" className="btn-primary" style={{ marginTop: "24px" }}>
          Đăng nhập ngay
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

  const isDirectCancellable = (order) => {
    return order?.isDirectCancellable === true;
  };

  const isCancelRequestable = (order) => {
    return order?.isCancelRequestable === true;
  };

  return (
    <div className="profile-page-wrapper container animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`toast-alert-profile ${toastMessage.type} animate-fade-in`}>
          {toastMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="profile-grid-layout">
        {/* Left Side: Navigation Sidebar & User Mini Card */}
        <aside className="profile-sidebar-pane">
          <div className="personal-info-card">
            <div className="user-profile-avatar-box">
              {avatarPreview ? (
                <img src={avatarPreview} alt={user.name} />
              ) : (
                <div className="avatar-letter">{user.name.charAt(0).toUpperCase()}</div>
              )}
            </div>
            
            <h3 className="user-profile-name">{user.name}</h3>
            <p className="user-profile-email">{user.email}</p>
            <p className="user-profile-role" style={{ marginBottom: "0" }}>Khách hàng thành viên</p>

            <nav className="profile-navigation-tabs">
              <button
                className={`nav-tab-btn ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <ClipboardList size={16} /> Đơn hàng của tôi
              </button>
              <button
                className={`nav-tab-btn ${activeTab === "edit-profile" ? "active" : ""}`}
                onClick={() => setActiveTab("edit-profile")}
              >
                <UserIcon size={16} /> Hồ sơ & Tiểu sử (Bio)
              </button>
              <button
                className={`nav-tab-btn ${activeTab === "addresses" ? "active" : ""}`}
                onClick={() => setActiveTab("addresses")}
              >
                <MapPin size={16} /> Sổ địa chỉ
              </button>
            </nav>

            <button onClick={logout} className="profile-logout-cta-btn" style={{ marginTop: "24px" }}>
              Đăng xuất tài khoản
            </button>
          </div>
        </aside>

        {/* Right Side: Tab Panel Content */}
        <main className="order-history-pane">
          {/* TAB 1: ORDERS HISTORY */}
          {activeTab === "orders" && (
            <>
              <h2 className="history-title">Đơn hàng của tôi</h2>
              <p className="history-subtitle">Theo dõi trạng thái giao hàng và quản lý các giao dịch.</p>

              {loadingOrders ? (
                <div className="orders-loading">
                  <div className="spinner"></div>
                  <p>Đang tìm lịch sử giao dịch...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="no-orders-card">
                  <ClipboardList size={40} color="var(--color-text-muted)" />
                  <p>Bạn chưa thực hiện bất kỳ đơn hàng nào.</p>
                  <Link to="/collection" className="btn-primary" style={{ marginTop: "16px" }}>
                    Mua truyện tranh ngay
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => {
                    const date = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const orderCode = `KOM-${order._id.slice(-6).toUpperCase()}`;

                    return (
                      <div key={order._id} className="order-summary-card animate-fade-in">
                        <div className="order-summary-header">
                          <div className="order-meta-info">
                            <span className="order-code">{orderCode}</span>
                            <span className="order-date"><Clock size={12} /> {date}</span>
                          </div>
                          
                          <div className="order-status-actions">
                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            {order.cancelRequest && (
                              <span className="status-badge badge-pending-cancel">Đang chờ duyệt hủy</span>
                            )}
                          </div>
                        </div>

                        <div className="order-summary-body">
                          <div className="order-items-preview">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="preview-item-row">
                                <img src={item.image} alt={item.title} className="preview-item-thumb" />
                                <div className="preview-item-info">
                                  <span className="preview-item-title">{item.title}</span>
                                  <span className="preview-item-qty">Số lượng: {item.quantity} x {formatPrice(item.price)}</span>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="more-items-text">và {order.items.length - 2} sản phẩm khác...</p>
                            )}
                          </div>

                          <div className="order-pricing-actions">
                            <div className="pricing-box">
                              <span className="pricing-label">Tổng cộng</span>
                              <span className="pricing-val">{formatPrice(order.totalAmount)}</span>
                            </div>

                            <div className="action-buttons-row">
                              <button
                                className="btn-secondary view-detail-order-btn"
                                onClick={() => navigate(`/order/${order._id}`)}
                              >
                                Theo dõi đơn hàng
                              </button>

                              {isDirectCancellable(order) && (
                                <button
                                  className="cancel-order-direct-btn"
                                  onClick={() => handleCancelOrder(order._id)}
                                  disabled={cancelLoading}
                                >
                                  Hủy đơn hàng
                                </button>
                              )}
                              
                              {isCancelRequestable(order) && (
                                <button
                                  className="cancel-order-request-btn"
                                  onClick={() => handleCancelOrder(order._id)}
                                  disabled={cancelLoading}
                                >
                                  Yêu cầu hủy
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: PROFILE EDIT & BIO WITH TINYMCE */}
          {activeTab === "edit-profile" && (
            <div className="profile-edit-section animate-fade-in">
              <h2 className="history-title">Chỉnh sửa hồ sơ cá nhân</h2>
              <p className="history-subtitle">Cập nhật thông tin công khai, ảnh đại diện và tiểu sử cá nhân.</p>

              <form onSubmit={handleProfileSubmit} className="profile-edit-form">
                {/* Avatar upload section */}
                <div className="avatar-upload-container">
                  <div className="avatar-preview-wrapper">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="avatar-upload-preview" />
                    ) : (
                      <div className="avatar-upload-letter">{profileName.charAt(0).toUpperCase() || "U"}</div>
                    )}
                    <label htmlFor="avatar-file-input" className="avatar-upload-label">
                      <Camera size={16} />
                    </label>
                    <input
                      type="file"
                      id="avatar-file-input"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                    />
                  </div>
                  <div className="avatar-upload-info">
                    <strong>Ảnh đại diện</strong>
                    <p>Hỗ trợ định dạng JPG, PNG, WEBP tối đa 5MB. Ảnh sẽ được lưu trữ đám mây Cloudinary.</p>
                  </div>
                </div>

                {/* Display Name Input */}
                <div className="form-input-wrapper" style={{ marginTop: "24px" }}>
                  <label htmlFor="edit-profile-name">Tên hiển thị *</label>
                  <input
                    type="text"
                    id="edit-profile-name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Nhập họ tên hiển thị"
                    required
                  />
                </div>

                {/* Email (Readonly) */}
                <div className="form-input-wrapper" style={{ marginTop: "20px" }}>
                  <label htmlFor="edit-profile-email">Địa chỉ Email (Không thể thay đổi)</label>
                  <input
                    type="email"
                    id="edit-profile-email"
                    value={user.email}
                    disabled
                    style={{ backgroundColor: "#FAF5EE", cursor: "not-allowed", color: "var(--color-text-muted)" }}
                  />
                </div>

                {/* TinyMCE Bio Editor */}
                <div className="form-input-wrapper" style={{ marginTop: "24px" }}>
                  <label>Tiểu sử của bạn (Bio - dùng TinyMCE)</label>
                  <div style={{ marginTop: "8px" }}>
                    <Editor
                      apiKey="cduhz73g0qtq9ufwh0mqc8u2hf1ksrwomn9e1bd0tij45fp5"
                      value={profileBio}
                      onEditorChange={(content) => setProfileBio(content)}
                      init={{
                        height: 320,
                        menubar: false,
                        plugins: [
                          "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                          "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                          "insertdatetime", "media", "table", "help", "wordcount"
                        ],
                        toolbar: "undo redo | blocks | " +
                          "bold italic forecolor | alignleft aligncenter " +
                          "alignright alignjustify | bullist numlist outdent indent | " +
                          "image | removeformat | help",
                        content_style: "body { font-family:var(--font-sans),Helvetica,Arial,sans-serif; font-size:14px; color:#2A2421; }",
                        // Cloudinary integration inside TinyMCE
                        images_upload_handler: async (blobInfo) => {
                          return new Promise(async (resolve, reject) => {
                            const formData = new FormData();
                            formData.append("file", blobInfo.blob(), blobInfo.filename());
                            try {
                              const res = await authAPI.uploadImage(formData);
                              resolve(res.location); // Cloudinary URL
                            } catch (err) {
                              reject("Không thể upload ảnh lên Cloudinary. Vui lòng thử lại.");
                            }
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary place-order-cta-btn"
                  style={{ marginTop: "32px", width: "fit-content", padding: "12px 36px" }}
                  disabled={profileSubmitting}
                >
                  {profileSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ADDRESS BOOK MANAGER */}
          {activeTab === "addresses" && (
            <div className="address-book-section animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h2 className="history-title" style={{ marginBottom: 0 }}>Sổ địa chỉ giao hàng</h2>
                {!showAddressForm && (
                  <button onClick={openNewAddressForm} className="btn-primary btn-add-address-header">
                    <Plus size={16} /> Thêm địa chỉ mới
                  </button>
                )}
              </div>
              <p className="history-subtitle">Quản lý danh sách địa chỉ giao hàng tiện lợi khi đặt mua truyện.</p>

              {showAddressForm ? (
                // Address Add/Edit Form
                <div className="address-form-card animate-fade-in">
                  <h3>{editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ giao hàng mới"}</h3>
                  <form onSubmit={handleAddressSubmit} className="address-inline-form">
                    <div className="form-group-grid">
                      <div className="form-input-wrapper">
                        <label htmlFor="address-name">Tên người nhận *</label>
                        <input
                          type="text"
                          id="address-name"
                          placeholder="Nguyễn Văn A"
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-input-wrapper">
                        <label htmlFor="address-phone">Số điện thoại SĐT *</label>
                        <input
                          type="tel"
                          id="address-phone"
                          placeholder="0912345678"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-input-wrapper" style={{ marginTop: "16px" }}>
                      <label htmlFor="address-detail-input">Địa chỉ chi tiết (Số nhà, tên đường...) *</label>
                      <input
                        type="text"
                        id="address-detail-input"
                        placeholder="123 Nguyễn Văn Cừ"
                        value={addrValue}
                        onChange={(e) => setAddrValue(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-input-wrapper" style={{ marginTop: "16px" }}>
                      <label htmlFor="address-city-input">Tỉnh / Thành phố *</label>
                      <input
                        type="text"
                        id="address-city-input"
                        placeholder="TP. Hồ Chí Minh"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        required
                      />
                    </div>

                    <label className="checkbox-container" style={{ marginTop: "20px" }}>
                      <input
                        type="checkbox"
                        checked={addrIsDefault}
                        onChange={(e) => setAddrIsDefault(e.target.checked)}
                        disabled={editingAddress?.isDefault} // Cannot unset if already default
                      />
                      <span className="checkmark"></span>
                      Đặt làm địa chỉ nhận hàng mặc định
                    </label>

                    <div className="form-actions-address" style={{ marginTop: "24px" }}>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={addressSubmitting}
                      >
                        {addressSubmitting ? "Đang lưu..." : "Lưu địa chỉ"}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Hủy bỏ
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // Addresses list
                <div className="addresses-list-wrapper">
                  {loadingAddresses ? (
                    <div className="orders-loading">
                      <div className="spinner"></div>
                      <p>Đang tìm danh sách địa chỉ...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="no-orders-card">
                      <MapPin size={40} color="var(--color-text-muted)" />
                      <p>Bạn chưa thêm địa chỉ nào vào sổ địa chỉ.</p>
                      <button onClick={openNewAddressForm} className="btn-primary" style={{ marginTop: "16px" }}>
                        Thêm địa chỉ giao hàng đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="addresses-grid">
                      {addresses.map((addr) => (
                        <div key={addr._id} className={`address-item-card ${addr.isDefault ? "default" : ""}`}>
                          <div className="address-item-header">
                            <strong>{addr.name}</strong>
                            {addr.isDefault && <span className="default-badge">Mặc định</span>}
                          </div>
                          
                          <div className="address-item-body">
                            <p className="phone">SĐT: {addr.phone}</p>
                            <p className="address">{addr.address}, {addr.city}</p>
                          </div>

                          <div className="address-item-footer">
                            <div className="action-buttons-left">
                              <button onClick={() => openEditAddressForm(addr)} className="btn-icon-text">
                                <Edit size={14} /> Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="btn-icon-text delete"
                                disabled={addr.isDefault}
                              >
                                <Trash2 size={14} /> Xóa
                              </button>
                            </div>

                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(addr._id)}
                                className="btn-set-default-link"
                              >
                                Thiết lập mặc định
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Visual Tracking Modal replaced by OrderDetailPage.jsx */}

      {showSuccessModal && (
        <div className="profile-modal-backdrop animate-fade-in" onClick={() => setShowSuccessModal(false)}>
          <div className="profile-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-icon-wrapper">
              <CheckCircle2 size={48} className="profile-modal-icon" />
            </div>
            <h3 className="profile-modal-title">Cập nhật thành công!</h3>
            <p className="profile-modal-message">
              Thông tin cá nhân và hồ sơ của bạn đã được cập nhật thành công trên hệ thống.
            </p>
            <button className="btn-primary profile-modal-btn" onClick={() => setShowSuccessModal(false)}>
              Đồng ý
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .profile-page-wrapper {
          padding-top: 48px;
        }

        /* Profile Success Modal Styles */
        .profile-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(42, 36, 33, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .profile-modal-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          width: 90%;
          max-width: 420px;
          padding: 40px 32px;
          text-align: center;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .profile-modal-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #EBF7EE;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .profile-modal-icon {
          color: #438258;
        }

        .profile-modal-title {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--color-text-main);
          margin-bottom: 12px;
        }

        .profile-modal-message {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .profile-modal-btn {
          width: 100%;
          padding: 12px;
          font-size: 0.95rem;
          font-weight: 600;
        }
        
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes scaleUp {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .profile-auth-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
          border: 1px dashed var(--border-color-dark);
          background-color: var(--bg-secondary);
          margin-top: 48px;
        }

        .toast-alert-profile {
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
        .toast-alert-profile.success {
          border-left: 4px solid #438258;
          color: #2e5c3e;
        }
        .toast-alert-profile.error {
          border-left: 4px solid #A34E36;
          color: #793724;
        }

        .profile-grid-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 48px;
          align-items: start;
        }

        /* Sidebar profile styling */
        .profile-sidebar-pane {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .personal-info-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 32px 20px;
          text-align: center;
          box-shadow: var(--shadow-sm);
        }
        .user-profile-avatar-box {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid var(--border-color-dark);
          margin: 0 auto 16px auto;
          overflow: hidden;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-profile-avatar-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .user-profile-bio-preview {
          text-align: left !important;
          max-width: 100%;
          overflow-x: hidden;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }
        .user-profile-bio-preview img {
          max-width: 100% !important;
          height: auto !important;
          display: block;
          margin: 12px auto;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .user-profile-bio-preview iframe,
        .user-profile-bio-preview video {
          max-width: 100% !important;
          height: auto !important;
        }
        .user-profile-bio-preview p {
          margin-bottom: 8px;
          line-height: 1.6;
        }
        .avatar-letter {
          font-size: 2.2rem;
          font-family: var(--font-serif);
          color: var(--color-accent);
          font-weight: bold;
        }
        .user-profile-name {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--color-text-main);
          margin-bottom: 4px;
        }
        .user-profile-email {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 6px;
          word-break: break-all;
        }
        .user-profile-role {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background-color: var(--color-accent-light);
          color: var(--color-accent);
          width: fit-content;
          margin: 8px auto 24px auto;
          padding: 2px 10px;
          font-weight: 500;
        }

        .profile-navigation-tabs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
          margin-top: 16px;
          border-top: 1px solid var(--border-color-dark);
          padding-top: 16px;
        }
        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          padding: 10px 14px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-muted);
          width: 100%;
          cursor: pointer;
          transition: var(--transition);
          border-radius: 2px;
        }
        .nav-tab-btn:hover {
          background-color: var(--bg-primary);
          color: var(--color-text-main);
        }
        .nav-tab-btn.active {
          background-color: var(--color-accent-light);
          color: var(--color-accent);
          font-weight: 600;
        }

        .profile-logout-cta-btn {
          width: 100%;
          border: 1px solid var(--border-color-dark);
          color: #A34E36;
          padding: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          background-color: white;
        }
        .profile-logout-cta-btn:hover {
          background-color: #FDF2F0;
          border-color: #A34E36;
        }

        /* Right panel Orders */
        .history-title {
          font-size: 2.4rem;
          font-weight: 400;
          margin-bottom: 6px;
        }
        .history-subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--color-text-muted);
          font-size: 1.1rem;
          margin-bottom: 32px;
          border-left: 2px solid var(--color-accent);
          padding-left: 12px;
        }

        .orders-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
        }
        .no-orders-card {
          border: 1px dashed var(--border-color-dark);
          padding: 64px 24px;
          text-align: center;
          background-color: var(--bg-secondary);
        }
        .no-orders-card p {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          margin-top: 12px;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .order-summary-card {
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
        }
        .order-summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
          background-color: #FAF5EE;
          flex-wrap: wrap;
          gap: 12px;
        }
        .order-code {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-accent);
          margin-right: 16px;
        }
        .order-date {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        
        .order-status-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-badge {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 3px 8px;
          font-weight: 600;
          border-radius: 2px;
        }
        .badge-pending {
          background-color: #ECE5DC;
          color: var(--color-text-main);
        }
        .badge-preparing {
          background-color: #E2ECF7;
          color: #2F6196;
        }
        .badge-shipping {
          background-color: #FAF2E3;
          color: #8C6212;
        }
        .badge-delivered {
          background-color: #E6F3EA;
          color: #237A3D;
        }
        .badge-cancelled {
          background-color: #FDF2F0;
          color: #A34E36;
        }
        .badge-pending-cancel {
          background-color: #FDF2F0;
          color: #A34E36;
          border: 1px dashed #A34E36;
        }

        .order-summary-body {
          padding: 24px;
        }
        
        .order-items-preview {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .preview-item-row {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .preview-item-thumb {
          width: 44px;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          border: 1px solid var(--border-color);
        }
        .preview-item-title {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-text-main);
          display: block;
        }
        .preview-item-qty {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .more-items-text {
          font-size: 0.8rem;
          font-style: italic;
          color: var(--color-text-muted);
        }

        .order-pricing-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px dashed var(--border-color-dark);
          padding-top: 16px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .pricing-box {
          display: flex;
          flex-direction: column;
        }
        .pricing-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }
        .pricing-val {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--color-accent);
        }

        .action-buttons-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .view-detail-order-btn {
          padding: 8px 16px;
          font-size: 0.85rem;
        }
        
        .cancel-order-direct-btn {
          background-color: #FAF5EE;
          border: 1px solid #CEBFAD;
          color: #A34E36;
          padding: 8px 16px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: var(--transition);
        }
        .cancel-order-direct-btn:hover {
          background-color: #FDF2F0;
          border-color: #A34E36;
        }
        
        .cancel-order-request-btn {
          background-color: #FAF5EE;
          border: 1px solid #CEBFAD;
          color: var(--color-text-muted);
          padding: 8px 16px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: var(--transition);
        }
        .cancel-order-request-btn:hover {
          background-color: #ECE5DC;
          color: var(--color-text-main);
          border-color: var(--color-text-main);
        }

        /* Profile edit tab custom styling */
        .profile-edit-section {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 32px;
          box-shadow: var(--shadow-sm);
        }
        .profile-edit-form {
          display: flex;
          flex-direction: column;
        }
        .avatar-upload-container {
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 1px dashed var(--border-color-dark);
          padding-bottom: 24px;
        }
        .avatar-preview-wrapper {
          position: relative;
          width: 96px;
          height: 96px;
        }
        .avatar-upload-preview {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--color-accent);
        }
        .avatar-upload-letter {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 2px dashed var(--border-color-dark);
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-family: var(--font-serif);
          color: var(--color-accent);
        }
        .avatar-upload-label {
          position: absolute;
          bottom: 0;
          right: 0;
          background-color: var(--color-accent);
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: var(--transition);
          border: 2px solid var(--bg-secondary);
        }
        .avatar-upload-label:hover {
          background-color: var(--color-accent-hover);
        }
        .avatar-upload-info strong {
          display: block;
          font-size: 1rem;
          margin-bottom: 4px;
        }
        .avatar-upload-info p {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          line-height: 1.4;
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
        .form-input-wrapper input {
          background-color: white;
          border-color: var(--border-color-dark);
          font-size: 0.9rem;
        }

        /* Address Book styling */
        .address-book-section {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 32px;
          box-shadow: var(--shadow-sm);
        }
        .btn-add-address-header {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 0.85rem;
        }
        .address-form-card {
          border: 1px solid var(--border-color-dark);
          background-color: white;
          padding: 24px;
          margin-top: 8px;
        }
        .address-form-card h3 {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          margin-bottom: 20px;
          color: var(--color-accent);
        }
        .form-group-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .checkbox-container {
          display: flex;
          align-items: center;
          position: relative;
          padding-left: 26px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--color-text-muted);
          user-select: none;
        }
        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        .checkmark {
          position: absolute;
          top: 2px;
          left: 0;
          height: 16px;
          width: 16px;
          border: 1px solid var(--border-color-dark);
          border-radius: 2px;
          background-color: white;
        }
        .checkbox-container input:checked ~ .checkmark {
          background-color: var(--color-accent);
          border-color: var(--color-accent);
        }
        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }
        .checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }
        .checkbox-container .checkmark:after {
          left: 5px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .form-actions-address {
          display: flex;
          gap: 12px;
        }
        .form-actions-address button {
          padding: 10px 24px;
          font-size: 0.9rem;
        }

        .addresses-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .address-item-card {
          border: 1px solid var(--border-color);
          background-color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          transition: var(--transition);
        }
        .address-item-card.default {
          border-color: var(--color-accent);
          box-shadow: 0 4px 12px rgba(108, 61, 47, 0.05);
        }
        .address-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .address-item-header strong {
          font-size: 1rem;
          color: var(--color-text-main);
        }
        .default-badge {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          background-color: var(--color-accent-light);
          color: var(--color-accent);
          padding: 2px 8px;
          border-radius: 2px;
        }
        .address-item-body {
          font-size: 0.85rem;
          color: var(--color-text-main);
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .address-item-body .phone {
          color: var(--color-text-muted);
          margin-bottom: 4px;
        }
        .address-item-footer {
          border-top: 1px solid #FAF5EE;
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .action-buttons-left {
          display: flex;
          gap: 12px;
        }
        .btn-icon-text {
          background: transparent;
          border: none;
          padding: 0;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .btn-icon-text:hover {
          color: var(--color-accent);
        }
        .btn-icon-text.delete:hover {
          color: #A34E36;
        }
        .btn-icon-text:disabled {
          color: #ddd;
          cursor: not-allowed;
        }
        .btn-set-default-link {
          background: transparent;
          border: none;
          font-size: 0.8rem;
          color: var(--color-accent);
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }
        .btn-set-default-link:hover {
          text-decoration: underline;
        }

        /* Tracking Visual Modal */
        .tracking-modal-overlay {
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
        .tracking-modal-container {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color-dark);
          width: 100%;
          max-width: 800px;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }
        .tracking-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
        }
        .tracking-modal-header h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
        }
        .back-btn {
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-text-muted);
        }
        .back-btn:hover {
          color: var(--color-accent);
        }
        .close-btn {
          font-size: 1.8rem;
          color: var(--color-text-muted);
        }

        .tracking-modal-body {
          padding: 32px;
          overflow-y: auto;
          flex: 1;
        }

        /* Stepper Stepper Stepper */
        .tracking-stepper {
          padding: 20px 0 40px 0;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 32px;
        }
        .stepper-cancelled {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .stepper-cancelled h4 {
          font-size: 1.3rem;
          color: #A34E36;
        }
        .stepper-cancelled p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .stepper-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
          position: relative;
        }
        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--border-color-dark);
          background-color: white;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          z-index: 2;
          transition: var(--transition);
        }
        .step-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-text-muted);
          text-align: center;
        }
        
        .step-item.active .step-number {
          border-color: var(--color-accent);
          background-color: var(--color-accent);
          color: white;
        }
        .step-item.active .step-label {
          color: var(--color-accent);
          font-weight: 600;
        }
        
        .step-connector {
          height: 2px;
          background-color: var(--border-color-dark);
          flex: 1.5;
          margin-bottom: 22px;
          transition: var(--transition);
        }
        .step-connector.active {
          background-color: var(--color-accent);
        }

        .tracking-details-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 32px;
          align-items: start;
        }
        .details-card {
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          padding: 24px;
        }
        .card-sec-title {
          font-family: var(--font-serif);
          font-size: 1.2rem;
          color: var(--color-accent);
          border-bottom: 1px solid var(--border-color-dark);
          padding-bottom: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-body-text {
          font-size: 0.85rem;
        }
        .recipient-name {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        .recipient-phone {
          color: var(--color-text-muted);
          margin-bottom: 4px;
        }
        .recipient-address {
          color: var(--color-text-main);
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .recipient-notes {
          font-style: italic;
          color: var(--color-text-muted);
          background-color: white;
          padding: 8px;
          border-left: 2px solid var(--color-accent);
        }

        .tracking-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }
        .tracking-item-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .tracking-item-row img {
          width: 36px;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          border: 1px solid var(--border-color);
        }
        .tracking-item-row .item-title {
          font-family: var(--font-serif);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-main);
        }
        .tracking-item-row .item-qty-price {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .tracking-summary-pricing {
          border-top: 1px dashed var(--border-color-dark);
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tracking-summary-pricing .price-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .tracking-summary-pricing .price-row.grand-total {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-accent);
        }
        .tracking-summary-pricing .free {
          color: var(--color-text-main);
          font-weight: 500;
        }

        .tracking-modal-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
        }
        .pending-cancel-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #A34E36;
          font-size: 0.8rem;
          font-weight: 500;
        }

        @media (max-width: 992px) {
          .profile-grid-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .addresses-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .tracking-details-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .form-group-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}} />
    </div>
  );
};

export default ProfilePage;
