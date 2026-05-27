import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { comicAPI, categoryAPI } from "../services/api";
import ComicCard from "../components/ComicCard";

const CollectionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [comics, setComics] = useState([]);
  const [accumulatedComics, setAccumulatedComics] = useState([]);
  const [paginationMode, setPaginationMode] = useState("horizontal"); // "horizontal" or "vertical"
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6, // 6 items per page as shown in mockup (2 rows of 3)
    totalPages: 1,
  });

  // Read URL query parameters
  const keyword = searchParams.get("keyword") || "";
  const selectedCategory = searchParams.get("category") || "";
  const selectedStatus = searchParams.get("status") || ""; // "available" or "outofstock"
  const activePage = Number(searchParams.get("page")) || 1;
  const activeSort = searchParams.get("sort") || "newest";

  // State for search bar
  const [searchKeyword, setSearchKeyword] = useState(keyword);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        if (res.success) {
          setCategories(res.data.categories || res.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Comics based on filter inputs
  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      try {
        const params = {
          page: activePage,
          limit: 6, // 6 items to match pagination layout in mockup
          keyword,
          category: selectedCategory,
          status: selectedStatus,
          sort: activeSort,
        };

        const res = await comicAPI.getComics(params);
        if (res.success) {
          setComics(res.data.comics);
          if (activePage === 1) {
            setAccumulatedComics(res.data.comics);
          } else {
            setAccumulatedComics((prev) => [...prev, ...res.data.comics]);
          }
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error("Error fetching comics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, [keyword, selectedCategory, selectedStatus, activePage, activeSort]);

  // Sync state with URL parameter if updated elsewhere
  useEffect(() => {
    setSearchKeyword(keyword);
  }, [keyword]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1"); // Reset to page 1 on filter change
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters("keyword", searchKeyword);
  };

  const clearFilters = () => {
    setSearchKeyword("");
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="collection-page-wrapper container animate-fade-in">
      <div className="collection-header">
        <h1 className="collection-title">Bộ sưu tập truyện</h1>
        <p className="collection-subtitle">
          Nơi lưu giữ những câu chuyện giản đơn, những lát cắt cuộc sống mang đậm hơi thở của thời gian và sự tĩnh lặng.
        </p>
      </div>

      <div className="collection-layout">
        {/* Left Filter Sidebar */}
        <aside className="filter-sidebar">
          {/* Search Bar */}
          <div className="filter-group">
            <h4 className="filter-title">Tìm kiếm</h4>
            <form onSubmit={handleSearchSubmit} className="sidebar-search">
              <input
                type="text"
                placeholder="Tìm tựa truyện..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="filter-group">
            <h4 className="filter-title">THỂ LOẠI</h4>
            <div className="filter-options">
              {categories.map((cat) => {
                const catId = cat._id || cat.id;
                const isSelected = selectedCategory === catId;
                return (
                  <label key={catId} className={`filter-radio-label ${isSelected ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="category"
                      checked={isSelected}
                      onChange={() => updateFilters("category", isSelected ? "" : catId)}
                    />
                    <span className="radio-dot"></span>
                    <span className="option-name">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status List */}
          <div className="filter-group">
            <h4 className="filter-title">TRẠNG THÁI</h4>
            <div className="filter-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedStatus === "available"}
                  onChange={(e) => updateFilters("status", e.target.checked ? "available" : "")}
                />
                <span className="checkmark"></span>
                Đang bán (Còn hàng)
              </label>
              
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedStatus === "outofstock"}
                  onChange={(e) => updateFilters("status", e.target.checked ? "outofstock" : "")}
                />
                <span className="checkmark"></span>
                Tạm hết hàng
              </label>
            </div>
          </div>

          {/* Sort Option */}
          <div className="filter-group">
            <h4 className="filter-title">Sắp xếp theo</h4>
            <select
              value={activeSort}
              onChange={(e) => updateFilters("sort", e.target.value)}
              className="sidebar-sort-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="bestseller">Bán chạy nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <button className="clear-filter-btn" onClick={clearFilters}>
            <RotateCcw size={14} /> XÓA BỘ LỌC
          </button>
        </aside>

        {/* Right Comics Grid Area */}
        <main className="comics-main-area">
          <div className="collection-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px dashed var(--border-color-dark)", paddingBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
              Hiển thị {paginationMode === "horizontal" ? comics.length : accumulatedComics.length} trong số {pagination.total} truyện
            </span>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Chế độ xem:</span>
              <button
                type="button"
                onClick={() => {
                  setPaginationMode("horizontal");
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("page", "1");
                  setSearchParams(newParams);
                }}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  backgroundColor: paginationMode === "horizontal" ? "var(--color-accent)" : "white",
                  color: paginationMode === "horizontal" ? "white" : "var(--color-text-main)",
                  border: "1px solid var(--border-color-dark)",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "var(--transition)"
                }}
              >
                Phân trang ngang
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaginationMode("vertical");
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("page", "1");
                  setSearchParams(newParams);
                }}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  backgroundColor: paginationMode === "vertical" ? "var(--color-accent)" : "white",
                  color: paginationMode === "vertical" ? "white" : "var(--color-text-main)",
                  border: "1px solid var(--border-color-dark)",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "var(--transition)"
                }}
              >
                Tải thêm (Dọc)
              </button>
            </div>
          </div>

          {keyword && (
            <div className="search-result-info" style={{ marginTop: "-8px", marginBottom: "20px" }}>
              Kết quả tìm kiếm cho: <strong>"{keyword}"</strong> ({pagination.total} truyện)
            </div>
          )}

          {loading && (paginationMode === "horizontal" || activePage === 1) ? (
            <div className="collection-loading">
              <div className="spinner"></div>
              <p>Đang tìm kiếm sách trên kệ...</p>
            </div>
          ) : (paginationMode === "horizontal" ? comics.length : accumulatedComics.length) === 0 ? (
            <div className="no-comics-found">
              <p>Không tìm thấy tác phẩm nào khớp với bộ lọc của bạn.</p>
              <button onClick={clearFilters} className="btn-secondary" style={{ marginTop: "16px" }}>
                Xem tất cả truyện
              </button>
            </div>
          ) : (
            <>
              <div className="grid-products-collection">
                {(paginationMode === "horizontal" ? comics : accumulatedComics).map((comic) => (
                  <ComicCard key={comic._id} comic={comic} />
                ))}
              </div>

              {/* Styled Horizontal Pagination */}
              {paginationMode === "horizontal" && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(activePage - 1)}
                    disabled={activePage === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`page-btn ${p === activePage ? "active" : ""}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(activePage + 1)}
                    disabled={activePage === pagination.totalPages}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Load More Vertical Pagination */}
              {paginationMode === "vertical" && pagination.page < pagination.totalPages && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set("page", (activePage + 1).toString());
                      setSearchParams(newParams);
                    }}
                    className="btn-primary"
                    style={{ padding: "12px 32px", fontSize: "0.9rem", width: "fit-content" }}
                    disabled={loading}
                  >
                    {loading ? "Đang tải thêm..." : "Tải thêm truyện tranh"}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .collection-header {
          padding-top: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 40px;
        }
        .collection-title {
          font-size: 2.8rem;
          font-weight: 400;
          margin-bottom: 8px;
        }
        .collection-subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--color-text-muted);
          font-size: 1.15rem;
          line-height: 1.6;
          border-left: 2px solid var(--color-accent);
          padding-left: 16px;
        }
        
        .collection-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 48px;
          align-items: start;
        }

        /* Sidebar Styling */
        .filter-sidebar {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          position: sticky;
          top: 104px;
        }
        .filter-title {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-main);
          font-weight: 600;
          margin-bottom: 14px;
          border-bottom: 1px solid var(--border-color-dark);
          padding-bottom: 6px;
        }
        .sidebar-search {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color-dark);
          background-color: var(--bg-primary);
          padding: 2px;
          border-radius: 2px;
        }
        .sidebar-search input {
          border: none;
          width: 100%;
          padding: 8px;
          font-size: 0.85rem;
          background: transparent;
        }
        .sidebar-search input:focus {
          box-shadow: none;
        }
        .sidebar-search button {
          color: var(--color-accent);
          padding: 8px;
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Radio option */
        .filter-radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--color-text-muted);
          transition: var(--transition);
        }
        .filter-radio-label:hover {
          color: var(--color-text-main);
        }
        .filter-radio-label input {
          display: none;
        }
        .radio-dot {
          width: 12px;
          height: 12px;
          border: 1px solid var(--border-color-dark);
          border-radius: 50%;
          display: inline-block;
          position: relative;
        }
        .filter-radio-label.active .radio-dot {
          border-color: var(--color-accent);
        }
        .filter-radio-label.active .radio-dot::after {
          content: "";
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: var(--color-accent);
          border-radius: 50%;
          top: 2px;
          left: 2px;
        }
        .filter-radio-label.active .option-name {
          color: var(--color-accent);
          font-weight: 600;
        }

        /* Checkbox option */
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
          background-color: var(--bg-primary);
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

        .sidebar-sort-select {
          width: 100%;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color-dark);
          font-size: 0.85rem;
        }

        .clear-filter-btn {
          border: 1px solid var(--border-color-dark);
          color: var(--color-text-main);
          font-size: 0.85rem;
          font-weight: 500;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          background-color: var(--bg-primary);
        }
        .clear-filter-btn:hover {
          background-color: #ECE5DC;
          color: var(--color-accent);
          border-color: var(--color-accent);
        }

        /* Right grid styling */
        .grid-products-collection {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px 32px;
        }
        .search-result-info {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          margin-bottom: 24px;
        }
        .no-comics-found {
          padding: 80px 24px;
          text-align: center;
          border: 1px dashed var(--border-color-dark);
          background-color: var(--bg-secondary);
        }
        .collection-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
        }

        @media (max-width: 992px) {
          .collection-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .filter-sidebar {
            position: relative;
            top: 0;
          }
          .grid-products-collection {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .grid-products-collection {
            grid-template-columns: 1fr;
          }
          .collection-title {
            font-size: 2.2rem;
          }
        }
      `}} />
    </div>
  );
};

export default CollectionPage;
