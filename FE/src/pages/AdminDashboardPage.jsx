import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient, { adminAPI, categoryAPI } from "../services/api";
import { formatPrice } from "../components/ComicCard";
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Tag,
  Layers,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogOut
} from "lucide-react";

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  // States
  const [comics, setComics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Active Admin Tab state
  const [activeAdminTab, setActiveAdminTab] = useState("comics"); // "comics" or "orders"

  // Order management states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersTotalCount, setOrdersTotalCount] = useState(0);
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Detailed Order Modal state
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [detailedOrder, setDetailedOrder] = useState(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
  const [editOrderStatus, setEditOrderStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");

  // User management states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Form State for User Add / Edit
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null); // null means adding, string means editing
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("member");
  const [submittingUser, setSubmittingUser] = useState(false);

  // Pagination & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form State for Add / Edit
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null means adding, string means editing

  // Form Fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [volumes, setVolumes] = useState("1");
  const [publisher, setPublisher] = useState("");
  const [publishYear, setPublishYear] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Load functions
  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getCategories();
      if (res.success) {
        setCategories(res.data.categories || res.data);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const fetchComics = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        keyword: searchQuery,
        category: selectedCategoryFilter
      };
      const res = await adminAPI.getComics(params);
      if (res.success) {
        setComics(res.data.comics);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error("Error loading admin comics:", err);
      setError("Không thể tải danh sách truyện.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const params = {
        page: ordersPage,
        limit: 10,
        keyword: orderSearchQuery,
        status: orderStatusFilter,
      };
      const res = await adminAPI.getOrders(params);
      if (res.success) {
        setOrders(res.data.orders);
        setOrdersTotalPages(res.data.pagination.totalPages);
        setOrdersTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error("Error loading admin orders:", err);
      setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const openOrderDetail = async (orderId) => {
    setLoadingOrderDetail(true);
    setShowOrderDetailModal(true);
    try {
      const res = await adminAPI.getOrderDetail(orderId);
      if (res.success) {
        setDetailedOrder(res.data.order);
        setEditOrderStatus(res.data.order.status);
        setEditPaymentStatus(res.data.order.paymentStatus);
      }
    } catch (err) {
      console.error("Error loading order detail:", err);
      setError("Không thể tải chi tiết đơn hàng.");
      setShowOrderDetailModal(false);
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  const handleSaveOrderChanges = async () => {
    if (!detailedOrder) return;
    setUpdatingOrderStatus(true);
    try {
      // Update order status if changed
      if (editOrderStatus !== detailedOrder.status) {
        await adminAPI.updateOrderStatus(detailedOrder._id, editOrderStatus);
      }
      // Update payment status if changed
      if (editPaymentStatus !== detailedOrder.paymentStatus) {
        await adminAPI.updateOrderPaymentStatus(detailedOrder._id, editPaymentStatus);
      }

      setSuccessMsg("Cập nhật đơn hàng thành công!");
      // Refresh detail
      const detailRes = await adminAPI.getOrderDetail(detailedOrder._id);
      if (detailRes.success) {
        setDetailedOrder(detailRes.data.order);
        setEditOrderStatus(detailRes.data.order.status);
        setEditPaymentStatus(detailRes.data.order.paymentStatus);
      }
      fetchOrders();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err.response?.data?.message || "Lỗi cập nhật đơn hàng.");
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = {
        page: usersPage,
        limit: 10,
        keyword: userSearchQuery,
        role: userRoleFilter,
      };
      const res = await adminAPI.getUsers(params);
      if (res.success) {
        setUsers(res.data.users);
        setUsersTotalPages(res.data.pagination.totalPages);
        setUsersTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error("Error loading admin users:", err);
      setError("Không thể tải danh sách tài khoản.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const openAddUserForm = () => {
    setEditingUserId(null);
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setUserRole("member");
    setShowUserForm(true);
  };

  const openEditUserForm = (u) => {
    setEditingUserId(u._id);
    setUserName(u.name || "");
    setUserEmail(u.email || "");
    setUserPassword("");
    setUserRole(u.role || "member");
    setShowUserForm(true);
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !userEmail || (!editingUserId && !userPassword)) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setSubmittingUser(true);
    setError(null);

    try {
      const payload = {
        name: userName,
        email: userEmail,
        role: userRole,
      };
      if (!editingUserId) {
        payload.password = userPassword;
      }

      let res;
      if (editingUserId) {
        res = await adminAPI.updateUser(editingUserId, payload);
      } else {
        res = await adminAPI.createUser(payload);
      }

      if (res.success) {
        setSuccessMsg(editingUserId ? "Cập nhật tài khoản thành công!" : "Tạo tài khoản thành công!");
        setShowUserForm(false);
        fetchUsers();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setError(res.message || "Lỗi lưu tài khoản.");
      }
    } catch (err) {
      console.error("Submit user form error:", err);
      setError(err.response?.data?.message || "Lỗi lưu tài khoản.");
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xoá tài khoản "${name}"? Thao tác này không thể hoàn tác.`)) {
      try {
        const res = await adminAPI.deleteUser(id);
        if (res.success) {
          setSuccessMsg("Xoá tài khoản thành công!");
          fetchUsers();
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      } catch (err) {
        console.error("Delete user error:", err);
        setError(err.response?.data?.message || "Lỗi khi xoá tài khoản.");
      }
    }
  };

  useEffect(() => {
    fetchCategories();
    // Get initial orders count for stats
    const getInitialOrderCount = async () => {
      try {
        const res = await adminAPI.getOrders({ limit: 1 });
        if (res.success) {
          setOrdersTotalCount(res.data.pagination.total);
        }
      } catch (err) {
        console.error("Error loading initial orders count:", err);
      }
    };
    // Get initial users count for stats
    const getInitialUserCount = async () => {
      try {
        const res = await adminAPI.getUsers({ limit: 1 });
        if (res.success) {
          setUsersTotalCount(res.data.pagination.total);
        }
      } catch (err) {
        console.error("Error loading initial users count:", err);
      }
    };
    getInitialOrderCount();
    getInitialUserCount();
  }, []);

  useEffect(() => {
    if (activeAdminTab === "comics") {
      fetchComics();
    }
  }, [page, searchQuery, selectedCategoryFilter, activeAdminTab]);

  useEffect(() => {
    if (activeAdminTab === "orders") {
      fetchOrders();
    }
  }, [ordersPage, orderSearchQuery, orderStatusFilter, activeAdminTab]);

  useEffect(() => {
    if (activeAdminTab === "users") {
      fetchUsers();
    }
  }, [usersPage, userSearchQuery, userRoleFilter, activeAdminTab]);

  // Form Open Helpers
  const openAddForm = () => {
    setEditingId(null);
    setTitle("");
    setAuthor("");
    setDescription("");
    setPrice("");
    setDiscount("");
    setStock("");
    setCategory(categories[0]?._id || "");
    setTags("");
    setVolumes("1");
    setPublisher("");
    setPublishYear("");
    setIsFeatured(false);
    setIsNew(false);
    setIsBestSeller(false);
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingImages([]);
    setShowForm(true);
  };

  const openEditForm = (comic) => {
    setEditingId(comic._id);
    setTitle(comic.title || "");
    setAuthor(comic.author || "");
    setDescription(comic.description || "");
    setPrice(comic.price || "");
    setDiscount(comic.discount || "");
    setStock(comic.stock || "");
    setCategory(comic.category?._id || comic.category || "");
    setTags(comic.tags ? comic.tags.join(", ") : "");
    setVolumes(comic.volumes ? comic.volumes.toString() : "1");
    setPublisher(comic.publisher || "");
    setPublishYear(comic.publishYear || "");
    setIsFeatured(!!comic.isFeatured);
    setIsNew(!!comic.isNew);
    setIsBestSeller(!!comic.isBestSeller);
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingImages(comic.images || []);
    setShowForm(true);
  };

  // Image Selection Handle
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setFilePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const deleteExistingImage = async (imgUrl) => {
    if (window.confirm("Bạn muốn xóa ảnh này khỏi sản phẩm?")) {
      try {
        // Backend expects DELETE /api/v1/admin/comics/:id/images with imageUrl in body
        // Or we can just filter it on Frontend and submit on Save.
        // Let's filter locally and update state. On update request, we can pass remaining images array in req.body
        // But our controller requires: DELETE /api/v1/admin/comics/:id/images with { imageUrl } in body. Let's do it immediately.
        const res = await apiClient.delete(`/admin/comics/${editingId}/images`, { data: { imageUrl: imgUrl } });
        if (res.data.success) {
          setExistingImages(res.data.data.images);
          setSuccessMsg("Đã xóa ảnh thành công.");
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      } catch (err) {
        console.error("Delete image error:", err);
      }
    }
  };

  // Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author || !price || !category) {
      setError("Vui lòng điền các trường bắt buộc.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("discount", discount || 0);
      formData.append("stock", stock || 0);
      formData.append("category", category);
      formData.append("tags", tags);
      formData.append("volumes", volumes);
      formData.append("publisher", publisher);
      formData.append("publishYear", publishYear);
      formData.append("isFeatured", isFeatured.toString());
      formData.append("isNew", isNew.toString());
      formData.append("isBestSeller", isBestSeller.toString());
      
      // Append files
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      let res;
      if (editingId) {
        // For edits, we send update requests
        res = await adminAPI.updateComic(editingId, formData);
      } else {
        // For creations
        res = await adminAPI.createComic(formData);
      }

      if (res.success) {
        setSuccessMsg(editingId ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
        setShowForm(false);
        fetchComics();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(res.message || "Lỗi xử lý sản phẩm.");
      }
    } catch (err) {
      console.error("Submit form error:", err);
      setError(err.response?.data?.message || "Lỗi lưu thông tin sản phẩm.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Comic
  const handleDeleteComic = async (id, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa truyện "${title}"? Thao tác này không thể hoàn tác.`)) {
      try {
        const res = await adminAPI.deleteComic(id);
        if (res.success) {
          setSuccessMsg("Đã xóa truyện tranh thành công!");
          fetchComics();
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      } catch (err) {
        console.error("Delete comic error:", err);
        setError("Lỗi khi xóa truyện tranh.");
      }
    }
  };

  return (
    <div className="admin-dashboard container animate-fade-in">
      {/* Toast Alert */}
      {successMsg && (
        <div className="toast-alert-profile success animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="toast-alert-profile error animate-fade-in" style={{ backgroundColor: "#FDF2F0", border: "1px solid #F3C4B8", color: "#A34E36" }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1 className="admin-title">Trang quản trị</h1>
          <p className="admin-subtitle">Hệ thống quản lý sản phẩm truyện tranh Komorebi</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {activeAdminTab === "comics" && (
            <button className="btn-primary add-product-btn" onClick={openAddForm}>
              <Plus size={16} /> Thêm truyện mới
            </button>
          )}
          {activeAdminTab === "users" && (
            <button className="btn-primary add-product-btn" onClick={openAddUserForm}>
              <Plus size={16} /> Thêm tài khoản mới
            </button>
          )}
          <button
            className="btn-icon"
            onClick={async () => { await logout(); navigate("/admin/login"); }}
            title="Đăng xuất"
            style={{ padding: "10px", borderRadius: "50%" }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs-nav" style={{ display: "flex", gap: "16px", marginBottom: "32px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
        <button 
          className={`tab-nav-item ${activeAdminTab === "comics" ? "active" : ""}`}
          onClick={() => { setActiveAdminTab("comics"); setShowForm(false); }}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.1rem",
            fontWeight: activeAdminTab === "comics" ? "600" : "400",
            color: activeAdminTab === "comics" ? "var(--color-accent)" : "var(--color-text-muted)",
            padding: "8px 16px",
            cursor: "pointer",
            borderBottom: activeAdminTab === "comics" ? "2px solid var(--color-accent)" : "2px solid transparent",
            display: "flex",
            alignItems: center => "center", // dummy
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <BookOpen size={18} />
          Sản phẩm
        </button>
        <button 
          className={`tab-nav-item ${activeAdminTab === "orders" ? "active" : ""}`}
          onClick={() => { setActiveAdminTab("orders"); setShowForm(false); }}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.1rem",
            fontWeight: activeAdminTab === "orders" ? "600" : "400",
            color: activeAdminTab === "orders" ? "var(--color-accent)" : "var(--color-text-muted)",
            padding: "8px 16px",
            cursor: "pointer",
            borderBottom: activeAdminTab === "orders" ? "2px solid var(--color-accent)" : "2px solid transparent",
            display: "flex",
            alignItems: center => "center", // dummy
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <Tag size={18} />
          Đơn hàng
        </button>
        <button 
          className={`tab-nav-item ${activeAdminTab === "users" ? "active" : ""}`}
          onClick={() => { setActiveAdminTab("users"); setShowForm(false); }}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.1rem",
            fontWeight: activeAdminTab === "users" ? "600" : "400",
            color: activeAdminTab === "users" ? "var(--color-accent)" : "var(--color-text-muted)",
            padding: "8px 16px",
            cursor: "pointer",
            borderBottom: activeAdminTab === "users" ? "2px solid var(--color-accent)" : "2px solid transparent",
            display: "flex",
            alignItems: center => "center", // dummy
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <Layers size={18} />
          Tài khoản
        </button>
      </div>

      {/* Stats Board */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <BookOpen className="stat-icon" size={24} />
          <div>
            <h3>{totalCount}</h3>
            <p>Tổng số tác phẩm</p>
          </div>
        </div>
        <div className="stat-card">
          <Layers className="stat-icon" size={24} />
          <div>
            <h3>{categories.length}</h3>
            <p>Danh mục thể loại</p>
          </div>
        </div>
        <div className="stat-card">
          <Tag className="stat-icon" size={24} />
          <div>
            <h3>{ordersTotalCount}</h3>
            <p>Tổng số đơn hàng</p>
          </div>
        </div>
        <div className="stat-card">
          <Layers className="stat-icon" size={24} />
          <div>
            <h3>{usersTotalCount}</h3>
            <p>Tổng số tài khoản</p>
          </div>
        </div>
      </div>

      {/* Main List Workspace */}
      {!showForm ? (
        <div className="admin-list-card animate-fade-in">
          {activeAdminTab === "comics" ? (
            <>
              {/* Filters toolbar */}
              <div className="admin-toolbar-row">
                <div className="search-bar-admin">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tác phẩm..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <select
                  className="admin-cat-filter"
                  value={selectedCategoryFilter}
                  onChange={(e) => {
                    setSelectedCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tất cả thể loại</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Table list */}
              {loading ? (
                <div className="admin-loading">
                  <div className="spinner"></div>
                  <p>Đang tìm dữ liệu sản phẩm...</p>
                </div>
              ) : comics.length === 0 ? (
                <div className="admin-empty-state">
                  <BookOpen size={40} color="var(--color-text-muted)" />
                  <p>Không tìm thấy sản phẩm nào.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Bìa sách</th>
                        <th>Tựa đề</th>
                        <th>Tác giả</th>
                        <th>Thể loại</th>
                        <th>Giá gốc</th>
                        <th>Giảm giá</th>
                        <th>Tồn kho</th>
                        <th style={{ textAlign: "center" }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comics.map((comic) => {
                        const cover = comic.images?.[0] || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100";
                        return (
                          <tr key={comic._id}>
                            <td>
                              <img src={cover} alt={comic.title} className="table-cover-img" />
                            </td>
                            <td>
                              <strong className="table-comic-title">{comic.title}</strong>
                            </td>
                            <td>{comic.author}</td>
                            <td>{comic.category?.name || "Khác"}</td>
                            <td>{formatPrice(comic.price)}</td>
                            <td>{comic.discount}%</td>
                            <td>{comic.stock}</td>
                            <td style={{ textAlign: "center" }}>
                              <div className="table-actions">
                                <button
                                  className="btn-icon edit-btn"
                                  onClick={() => openEditForm(comic)}
                                  title="Sửa"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="btn-icon delete-btn"
                                  onClick={() => handleDeleteComic(comic._id, comic.title)}
                                  title="Xóa"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination Row */}
                  {totalPages > 1 && (
                    <div className="pagination" style={{ marginTop: "24px" }}>
                      <button
                        className="page-btn"
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          className={`page-btn ${p === page ? "active" : ""}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        className="page-btn"
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : activeAdminTab === "orders" ? (
            <>
              {/* Order Filters toolbar */}
              <div className="admin-toolbar-row">
                <div className="search-bar-admin">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm mã, khách hàng, SĐT..."
                    value={orderSearchQuery}
                    onChange={(e) => {
                      setOrderSearchQuery(e.target.value);
                      setOrdersPage(1);
                    }}
                  />
                </div>

                <select
                  className="admin-cat-filter"
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                    setOrdersPage(1);
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="preparing">Đang chuẩn bị</option>
                  <option value="shipping">Đang vận chuyển</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              {/* Order Table list */}
              {loadingOrders ? (
                <div className="admin-loading">
                  <div className="spinner"></div>
                  <p>Đang tìm dữ liệu đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="admin-empty-state">
                  <Tag size={40} color="var(--color-text-muted)" />
                  <p>Không tìm thấy đơn hàng nào.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: "12%" }}>Mã đơn hàng</th>
                        <th style={{ width: "18%" }}>Khách hàng</th>
                        <th style={{ width: "12%" }}>Ngày đặt</th>
                        <th style={{ width: "10%", textAlign: "center" }}>Phương thức</th>
                        <th style={{ width: "13%", textAlign: "center" }}>Thanh toán</th>
                        <th style={{ width: "13%", textAlign: "center" }}>Trạng thái</th>
                        <th style={{ width: "12%", textAlign: "right" }}>Tổng tiền</th>
                        <th style={{ width: "10%", textAlign: "center" }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const dateStr = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        });
                        
                        const getStatusLabel = (status) => {
                          const labels = {
                            pending: { text: "Chờ xử lý", color: "#B78A39", bg: "#FDF8F0" },
                            confirmed: { text: "Đã xác nhận", color: "#3B71CA", bg: "#EBF1FA" },
                            preparing: { text: "Đang chuẩn bị", color: "#6A5ACD", bg: "#F0EEF9" },
                            shipping: { text: "Đang vận chuyển", color: "#39B7B2", bg: "#F0FDFD" },
                            delivered: { text: "Đã giao hàng", color: "#198754", bg: "#F0F9F4" },
                            cancelled: { text: "Đã hủy", color: "#DC3545", bg: "#FDF0F1" }
                          };
                          return labels[status] || { text: status, color: "#6c757d", bg: "#f8f9fa" };
                        };

                        const getPaymentStatusLabel = (status) => {
                          const labels = {
                            pending: { text: "Chưa thanh toán", color: "#DC3545", bg: "#FDF0F1" },
                            paid: { text: "Đã thanh toán", color: "#198754", bg: "#F0F9F4" },
                            refunded: { text: "Đã hoàn tiền", color: "#6c757d", bg: "#f8f9fa" }
                          };
                          return labels[status] || { text: status, color: "#6c757d", bg: "#f8f9fa" };
                        };

                        const sLabel = getStatusLabel(order.status);
                        const pLabel = getPaymentStatusLabel(order.paymentStatus);

                        return (
                          <tr key={order._id}>
                            <td>
                              <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: "600" }}>
                                #{order._id.substring(order._id.length - 8).toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div><strong>{order.shippingAddress?.name || order.user?.name || "Khách"}</strong></div>
                                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{order.shippingAddress?.phone}</div>
                              </div>
                            </td>
                            <td>{dateStr}</td>
                            <td style={{ textAlign: "center" }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: "600", color: order.paymentMethod === "ONLINE" ? "#6A5ACD" : "#8B5A2B" }}>
                                {order.paymentMethod}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <span style={{ 
                                padding: "4px 8px", 
                                fontSize: "0.75rem", 
                                fontWeight: "600", 
                                color: pLabel.color, 
                                backgroundColor: pLabel.bg, 
                                borderRadius: "4px" 
                              }}>
                                {pLabel.text}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <span style={{ 
                                padding: "4px 8px", 
                                fontSize: "0.75rem", 
                                fontWeight: "600", 
                                color: sLabel.color, 
                                backgroundColor: sLabel.bg, 
                                borderRadius: "4px" 
                              }}>
                                {sLabel.text}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}><strong>{formatPrice(order.totalAmount)}</strong></td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                className="btn-icon edit-btn"
                                onClick={() => openOrderDetail(order._id)}
                                title="Xem chi tiết & duyệt đơn"
                              >
                                <Search size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Orders Pagination */}
                  {ordersTotalPages > 1 && (
                    <div className="pagination" style={{ marginTop: "24px" }}>
                      <button
                        className="page-btn"
                        onClick={() => setOrdersPage(prev => Math.max(prev - 1, 1))}
                        disabled={ordersPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: ordersTotalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          className={`page-btn ${p === ordersPage ? "active" : ""}`}
                          onClick={() => setOrdersPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        className="page-btn"
                        onClick={() => setOrdersPage(prev => Math.min(prev + 1, ordersTotalPages))}
                        disabled={ordersPage === ordersTotalPages}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Users Filters toolbar */}
              <div className="admin-toolbar-row">
                <div className="search-bar-admin">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm tên, email tài khoản..."
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setUsersPage(1);
                    }}
                  />
                </div>

                <select
                  className="admin-cat-filter"
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUsersPage(1);
                  }}
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                  <option value="member">Khách hàng (Member)</option>
                </select>
              </div>

              {/* Users Table list */}
              {loadingUsers ? (
                <div className="admin-loading">
                  <div className="spinner"></div>
                  <p>Đang tìm dữ liệu tài khoản...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="admin-empty-state">
                  <Layers size={40} color="var(--color-text-muted)" />
                  <p>Không tìm thấy tài khoản nào.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tên hiển thị</th>
                        <th>Email đăng nhập</th>
                        <th>Vai trò</th>
                        <th>Ngày tạo</th>
                        <th style={{ textAlign: "center" }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const dateStr = new Date(u.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        });
                        
                        return (
                          <tr key={u._id}>
                            <td>
                              <strong>{u.name}</strong>
                              {u._id === user?._id && (
                                <span style={{ marginLeft: "8px", fontSize: "0.7rem", backgroundColor: "var(--color-accent-light)", color: "var(--color-accent)", padding: "2px 6px", borderRadius: "4px" }}>
                                  Tôi
                                </span>
                              )}
                            </td>
                            <td>{u.email}</td>
                            <td>
                              <span style={{ 
                                padding: "4px 8px", 
                                fontSize: "0.75rem", 
                                fontWeight: "600", 
                                color: u.role === "admin" ? "#A34E36" : "#6c757d", 
                                backgroundColor: u.role === "admin" ? "rgba(163, 78, 54, 0.1)" : "#f8f9fa", 
                                borderRadius: "4px" 
                              }}>
                                {u.role === "admin" ? "Admin" : "Khách hàng"}
                              </span>
                            </td>
                            <td>{dateStr}</td>
                            <td style={{ textAlign: "center" }}>
                              <div className="table-actions">
                                <button
                                  className="btn-icon edit-btn"
                                  onClick={() => openEditUserForm(u)}
                                  title="Chỉnh sửa"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="btn-icon delete-btn"
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  title="Xóa"
                                  disabled={u._id === user?._id}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Users Pagination */}
                  {usersTotalPages > 1 && (
                    <div className="pagination" style={{ marginTop: "24px" }}>
                      <button
                        className="page-btn"
                        onClick={() => setUsersPage(prev => Math.max(prev - 1, 1))}
                        disabled={usersPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: usersTotalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          className={`page-btn ${p === usersPage ? "active" : ""}`}
                          onClick={() => setUsersPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        className="page-btn"
                        onClick={() => setUsersPage(prev => Math.min(prev + 1, usersTotalPages))}
                        disabled={usersPage === usersTotalPages}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Edit / Create Form Block */
        <div className="admin-form-card animate-fade-in">
          <div className="form-card-header">
            <h2>{editingId ? `Chỉnh sửa: ${title}` : "Thêm tác phẩm truyện tranh mới"}</h2>
            <button className="btn-close-form" onClick={() => setShowForm(false)}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="admin-comic-form">
            <div className="form-layout-cols">
              {/* Left Form Inputs column */}
              <div className="form-left-col">
                <div className="form-group-grid">
                  <div className="form-input-wrapper">
                    <label>Tên truyện tranh *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Komorebi Memoir"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-input-wrapper">
                    <label>Tác giả *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Makoto Shinkai"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-input-wrapper" style={{ marginTop: "16px" }}>
                  <label>Mô tả nội dung</label>
                  <textarea
                    rows={4}
                    placeholder="Tóm tắt sơ lược cốt truyện..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group-grid" style={{ marginTop: "16px" }}>
                  <div className="form-input-wrapper">
                    <label>Giá bán (VNĐ) *</label>
                    <input
                      type="number"
                      placeholder="Ví dụ: 65000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-input-wrapper">
                    <label>Giảm giá (%)</label>
                    <input
                      type="number"
                      placeholder="Ví dụ: 10"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </div>
                  <div className="form-input-wrapper">
                    <label>Số lượng tồn kho</label>
                    <input
                      type="number"
                      placeholder="Ví dụ: 100"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-grid" style={{ marginTop: "16px" }}>
                  <div className="form-input-wrapper">
                    <label>Thể loại *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                      <option value="" disabled>Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-input-wrapper">
                    <label>Số tập</label>
                    <input
                      type="number"
                      value={volumes}
                      onChange={(e) => setVolumes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-grid" style={{ marginTop: "16px" }}>
                  <div className="form-input-wrapper">
                    <label>Nhà xuất bản</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: NXB Kim Đồng"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                    />
                  </div>
                  <div className="form-input-wrapper">
                    <label>Năm xuất bản</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 2024"
                      value={publishYear}
                      onChange={(e) => setPublishYear(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-input-wrapper" style={{ marginTop: "16px" }}>
                  <label>Tags (cách nhau bằng dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: manga, sliceoflife, romance"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                {/* Checkbox triggers */}
                <div className="checkboxes-row-admin" style={{ marginTop: "24px" }}>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Tác phẩm nổi bật
                  </label>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Truyện mới về
                  </label>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Truyện bán chạy
                  </label>
                </div>
              </div>

              {/* Right Images upload column */}
              <div className="form-right-col">
                <div className="image-management-box">
                  <label className="image-box-label">Quản lý hình ảnh sản phẩm</label>

                  {/* Existing images (only if editing) */}
                  {existingImages.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <span className="sub-label">Ảnh hiện có trên Cloudinary:</span>
                      <div className="existing-images-grid">
                        {existingImages.map((img, idx) => (
                          <div key={idx} className="img-thumbnail-wrapper">
                            <img src={img} alt="Thumbnail" />
                            <button
                              type="button"
                              className="btn-delete-img"
                              onClick={() => deleteExistingImage(img)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected files pre-upload */}
                  <span className="sub-label">Ảnh mới chọn tải lên:</span>
                  <div className="pre-upload-grid">
                    {filePreviews.map((url, idx) => (
                      <div key={idx} className="img-thumbnail-wrapper">
                        <img src={url} alt="Pre-upload" />
                        <button
                          type="button"
                          className="btn-delete-img"
                          onClick={() => removeSelectedFile(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    <label htmlFor="comic-file-upload" className="upload-add-card">
                      <Upload size={24} />
                      <span>Chọn ảnh</span>
                    </label>
                    <input
                      type="file"
                      id="comic-file-upload"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </div>
                  <p className="upload-tip">Ảnh đầu tiên sẽ được lấy làm ảnh bìa sản phẩm.</p>
                </div>

                <div className="form-submit-row-admin">
                  <button
                    type="submit"
                    className="btn-submit-admin"
                    disabled={submitting}
                  >
                    {submitting ? "Đang xử lý..." : (editingId ? "Lưu thay đổi" : "Thêm mới sản phẩm")}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel-admin"
                    onClick={() => setShowForm(false)}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Styled Sheets for Admin Panel */}
      {/* Add / Edit User Form Modal */}
      {showUserForm && (
        <div className="admin-modal-overlay animate-fade-in" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div className="admin-modal-content animate-slide-up" style={{
            backgroundColor: "white",
            border: "1px solid var(--border-color)",
            width: "100%",
            maxWidth: "500px",
            padding: "32px",
            boxShadow: "var(--shadow-lg)",
            position: "relative",
            color: "var(--color-text-main)"
          }}>
            <button 
              onClick={() => setShowUserForm(false)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)"
              }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--color-accent)", marginBottom: "24px" }}>
              {editingUserId ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
            </h2>

            <form onSubmit={handleUserFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-input-wrapper">
                <label>Tên hiển thị *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-wrapper">
                <label>Email đăng nhập *</label>
                <input
                  type="email"
                  placeholder="Ví dụ: name@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  disabled={!!editingUserId}
                />
              </div>

              {!editingUserId && (
                <div className="form-input-wrapper">
                  <label>Mật khẩu đăng nhập *</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-input-wrapper">
                <label>Vai trò hệ thống *</label>
                <select 
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value)}
                  required
                >
                  <option value="member">Khách hàng (Member)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button
                  type="submit"
                  className="btn-submit-admin"
                  disabled={submittingUser}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  {submittingUser ? "Đang xử lý..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "transparent",
                    color: "var(--color-text-muted)",
                    border: "1px solid var(--border-color-dark)",
                    fontWeight: "600",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Order Modal */}
      {showOrderDetailModal && (
        <div className="admin-modal-overlay animate-fade-in" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div className="admin-modal-content animate-slide-up" style={{
            backgroundColor: "white",
            border: "1px solid var(--border-color)",
            width: "100%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "32px",
            boxShadow: "var(--shadow-lg)",
            position: "relative",
            color: "var(--color-text-main)"
          }}>
            <button 
              onClick={() => { setShowOrderDetailModal(false); setDetailedOrder(null); }}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)"
              }}
            >
              <X size={24} />
            </button>

            {loadingOrderDetail ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #eee", borderTopColor: "var(--color-accent)", animation: "spin 1s linear infinite" }}></div>
                <p style={{ marginTop: "16px", color: "var(--color-text-muted)" }}>Đang tải thông tin đơn hàng...</p>
              </div>
            ) : detailedOrder ? (
              <div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--color-accent)", marginBottom: "8px" }}>
                  Chi tiết đơn hàng #{detailedOrder._id.substring(detailedOrder._id.length - 8).toUpperCase()}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "24px" }}>
                  Ngày đặt: {new Date(detailedOrder.createdAt).toLocaleString("vi-VN")}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "32px" }}>
                  {/* Shipping Info */}
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "8px", marginBottom: "12px" }}>
                      Địa chỉ nhận hàng
                    </h3>
                    <p style={{ margin: "4px 0", fontSize: "0.9rem" }}><strong>Họ tên:</strong> {detailedOrder.shippingAddress?.name}</p>
                    <p style={{ margin: "4px 0", fontSize: "0.9rem" }}><strong>Điện thoại:</strong> {detailedOrder.shippingAddress?.phone}</p>
                    <p style={{ margin: "4px 0", fontSize: "0.9rem" }}><strong>Địa chỉ:</strong> {detailedOrder.shippingAddress?.address}</p>
                    <p style={{ margin: "4px 0", fontSize: "0.9rem" }}><strong>Thành phố:</strong> {detailedOrder.shippingAddress?.city}</p>
                    {detailedOrder.note && (
                      <p style={{ margin: "8px 0 0 0", fontSize: "0.9rem", fontStyle: "italic", color: "var(--color-text-muted)" }}>
                        <strong>Ghi chú:</strong> {detailedOrder.note}
                      </p>
                    )}
                  </div>

                  {/* Payment & Action Info */}
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "8px", marginBottom: "12px" }}>
                      Trạng thái & Thanh toán
                    </h3>
                    <p style={{ margin: "4px 0", fontSize: "0.9rem" }}><strong>Hình thức:</strong> {detailedOrder.paymentMethod}</p>
                    
                    <div style={{ marginTop: "16px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
                        Trạng thái đơn hàng:
                      </label>
                      <select 
                        value={editOrderStatus}
                        onChange={(e) => setEditOrderStatus(e.target.value)}
                        disabled={updatingOrderStatus}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid var(--border-color)",
                          backgroundColor: "#f8f9fa"
                        }}
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận (Duyệt)</option>
                        <option value="preparing">Đang chuẩn bị hàng</option>
                        <option value="shipping">Đang vận chuyển</option>
                        <option value="delivered">Đã giao hàng thành công</option>
                        <option value="cancelled">Đã hủy đơn hàng</option>
                      </select>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
                        Trạng thái thanh toán:
                      </label>
                      <select 
                        value={editPaymentStatus}
                        onChange={(e) => setEditPaymentStatus(e.target.value)}
                        disabled={updatingOrderStatus}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid var(--border-color)",
                          backgroundColor: "#f8f9fa"
                        }}
                      >
                        <option value="pending">Chưa thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="refunded">Đã hoàn tiền</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <h3 style={{ fontSize: "1rem", fontWeight: "600", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "8px", marginBottom: "16px" }}>
                  Danh sách sản phẩm
                </h3>
                <div style={{ marginBottom: "24px" }}>
                  {detailedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      padding: "12px 0", 
                      borderBottom: "1px solid #eee" 
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100"} 
                          alt={item.title} 
                          style={{ width: "50px", aspectRatio: "3/4", objectFit: "cover", border: "1px solid #ddd" }}
                        />
                        <div>
                          <strong style={{ fontSize: "0.95rem" }}>{item.title}</strong>
                          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                            {formatPrice(item.price)} x {item.quantity}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid var(--border-color-dark)", paddingTop: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1rem", color: "var(--color-text-muted)" }}>Tổng tiền:</span>
                    <strong style={{ fontSize: "1.4rem", color: "var(--color-accent)" }}>
                      {formatPrice(detailedOrder.totalAmount)}
                    </strong>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => { setShowOrderDetailModal(false); setDetailedOrder(null); }}
                      style={{
                        padding: "10px 24px",
                        backgroundColor: "transparent",
                        color: "var(--color-text-muted)",
                        border: "1px solid var(--border-color-dark)",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "0.9rem"
                      }}
                    >
                      Đóng
                    </button>
                    <button
                      onClick={handleSaveOrderChanges}
                      disabled={updatingOrderStatus || (editOrderStatus === detailedOrder.status && editPaymentStatus === detailedOrder.paymentStatus)}
                      style={{
                        padding: "10px 24px",
                        backgroundColor: (editOrderStatus !== detailedOrder.status || editPaymentStatus !== detailedOrder.paymentStatus) ? "var(--color-accent)" : "#ccc",
                        color: "white",
                        border: "none",
                        fontWeight: "600",
                        cursor: (editOrderStatus !== detailedOrder.status || editPaymentStatus !== detailedOrder.paymentStatus) ? "pointer" : "not-allowed",
                        fontSize: "0.9rem"
                      }}
                    >
                      {updatingOrderStatus ? "Đang cập nhật..." : "Cập nhật đơn hàng"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p>Lỗi hiển thị thông tin.</p>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .admin-dashboard {
          padding-top: 32px;
          padding-bottom: 48px;
          min-height: 100vh;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .admin-title {
          font-size: 2.8rem;
          font-weight: 400;
          margin-bottom: 8px;
        }
        .admin-subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--color-text-muted);
          font-size: 1.15rem;
          line-height: 1.6;
          border-left: 2px solid var(--color-accent);
          padding-left: 16px;
        }

        /* Stats Cards */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        .stat-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: var(--shadow-sm);
        }
        .stat-icon {
          color: var(--color-accent);
          background-color: var(--color-accent-light);
          padding: 12px;
          box-sizing: content-box;
          border-radius: 50%;
        }
        .stat-card h3 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-main);
          margin-bottom: 4px;
        }
        .stat-card p {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* Workspace List */
        .admin-list-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 32px;
          box-shadow: var(--shadow-sm);
        }
        .admin-toolbar-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .search-bar-admin {
          display: flex;
          align-items: center;
          background-color: white;
          border: 1px solid var(--border-color-dark);
          padding: 2px 12px;
          width: 320px;
        }
        .search-bar-admin input {
          border: none;
          padding: 8px;
          font-size: 0.85rem;
          width: 100%;
        }
        .search-bar-admin input:focus {
          box-shadow: none;
        }
        .search-bar-admin .search-icon {
          color: var(--color-text-muted);
        }

        .admin-cat-filter {
          background-color: white;
          border: 1px solid var(--border-color-dark);
          padding: 10px 16px;
          font-size: 0.85rem;
        }

        /* Table Design */
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          font-weight: 600;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color-dark);
        }
        .admin-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
        }
        .admin-table tbody tr:hover {
          background-color: rgba(0,0,0,0.01);
        }
        .table-cover-img {
          width: 40px;
          aspect-ratio: 3/4;
          object-fit: cover;
          border: 1px solid var(--border-color);
        }
        .table-comic-title {
          font-family: var(--font-serif);
          font-size: 1rem;
          color: var(--color-text-main);
        }
        .table-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .btn-icon {
          background: transparent;
          border: 1px solid var(--border-color-dark);
          padding: 8px;
          cursor: pointer;
          color: var(--color-text-muted);
          transition: var(--transition);
        }
        .btn-icon:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
          background-color: var(--color-accent-light);
        }
        .btn-icon.delete-btn:hover {
          border-color: #A34E36;
          color: #A34E36;
          background-color: #FDF2F0;
        }

        /* Admin Form Layout */
        .admin-form-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 32px;
          box-shadow: var(--shadow-sm);
        }
        .form-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color-dark);
          padding-bottom: 16px;
          margin-bottom: 32px;
        }
        .form-card-header h2 {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          color: var(--color-accent);
        }
        .btn-close-form {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
        }
        .btn-close-form:hover {
          color: var(--color-text-main);
        }

        .form-layout-cols {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 48px;
        }
        .form-group-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          align-items: start;
        }
        .form-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .form-input-wrapper label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-main);
        }
        .form-input-wrapper input,
        .form-input-wrapper select,
        .form-input-wrapper textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--color-text-main);
          font-size: 0.9rem;
          transition: var(--transition);
        }
        .form-input-wrapper input:focus,
        .form-input-wrapper select:focus,
        .form-input-wrapper textarea:focus {
          border-color: var(--color-accent);
          outline: none;
        }
        
        .checkboxes-row-admin {
          display: flex;
          gap: 24px;
        }

        .form-submit-row-admin {
          display: flex;
          gap: 16px;
          margin-top: 36px;
        }
        .form-submit-row-admin button {
          flex: 1;
          padding: 14px 24px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .btn-submit-admin {
          background-color: var(--color-accent);
          color: white;
        }
        .btn-submit-admin:hover {
          background-color: #8b3c25;
        }
        .btn-submit-admin:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-cancel-admin {
          background-color: transparent;
          border: 1px solid var(--border-color-dark) !important;
          color: var(--color-text-muted);
        }
        .btn-cancel-admin:hover {
          border-color: var(--color-text-main) !important;
          color: var(--color-text-main);
          background-color: rgba(0, 0, 0, 0.02);
        }

        .image-management-box {
          background-color: white;
          border: 1px solid var(--border-color-dark);
          padding: 24px;
        }
        .image-box-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          color: var(--color-text-main);
          display: block;
          margin-bottom: 16px;
        }
        .sub-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          display: block;
          margin-bottom: 8px;
        }
        .existing-images-grid, .pre-upload-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .img-thumbnail-wrapper {
          position: relative;
          aspect-ratio: 3/4;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }
        .img-thumbnail-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .btn-delete-img {
          position: absolute;
          top: 4px;
          right: 4px;
          background-color: rgba(163, 78, 54, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: pointer;
        }

        .upload-add-card {
          aspect-ratio: 3/4;
          border: 1px dashed var(--border-color-dark);
          background-color: var(--bg-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text-muted);
          transition: var(--transition);
          gap: 6px;
        }
        .upload-add-card:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
          background-color: var(--color-accent-light);
        }
        .upload-tip {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          margin-top: 8px;
          font-style: italic;
        }

        @media (max-width: 992px) {
          .admin-stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .form-layout-cols {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}} />
    </div>
  );
};

export default AdminDashboardPage;
