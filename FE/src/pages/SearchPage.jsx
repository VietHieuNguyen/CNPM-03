import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { comicsAPI, categoriesAPI } from '../api'
import ComicCard from '../components/ComicCard'
import { Search, Filter, X, SlidersHorizontal, ChevronLeft, ChevronRight, Tag } from 'lucide-react'

const SORT_OPTIONS = [
  { value: '', label: 'Mặc định' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'bestseller', label: 'Bán chạy' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
]

const TAGS = ['Action', 'Romance', 'Fantasy', 'Isekai', 'Horror', 'Comedy', 'Sports', 'Slice of Life', 'Mecha', 'Thriller', 'Adventure', 'Supernatural']

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [comics, setComics] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [showFilter, setShowFilter] = useState(false)

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    tags: searchParams.get('tags') || '',
    status: searchParams.get('status') || '',
    sort: searchParams.get('sort') || '',
    page: Number(searchParams.get('page')) || 1,
  })

  const [keywordInput, setKeywordInput] = useState(filters.keyword)

  useEffect(() => {
    categoriesAPI.list().then(res => setCategories(res.data.data.categories)).catch(() => {})
  }, [])

  const fetchComics = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.keyword) params.keyword = filters.keyword
      if (filters.category) params.category = filters.category
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.tags) params.tags = filters.tags
      if (filters.status) params.status = filters.status
      if (filters.sort) params.sort = filters.sort
      params.page = filters.page
      params.limit = 12

      const res = await comicsAPI.list(params)
      setComics(res.data.data.comics)
      setPagination(res.data.data.pagination)
      setSearchParams(params)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchComics() }, [fetchComics])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateFilter('keyword', keywordInput)
  }

  const clearAllFilters = () => {
    setFilters({ keyword: '', category: '', minPrice: '', maxPrice: '', tags: '', status: '', sort: '', page: 1 })
    setKeywordInput('')
  }

  const toggleTag = (tag) => {
    const currentTags = filters.tags ? filters.tags.split(',') : []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    updateFilter('tags', newTags.join(','))
  }

  const activeTagList = filters.tags ? filters.tags.split(',').filter(Boolean) : []
  const hasActiveFilters = filters.keyword || filters.category || filters.minPrice || filters.maxPrice || filters.tags || filters.status || filters.sort

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title text-2xl mb-2 font-serif">Tìm Kiếm & Khám Phá</h1>
        {pagination.total > 0 && (
          <p className="text-wabi-muted text-sm mt-2">Tìm thấy <span className="text-wabi-red font-bold">{pagination.total}</span> kết quả</p>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6" id="search-form">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-wabi-muted" />
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Tìm tên truyện, tác giả..."
            className="input-wabi pl-12"
            id="search-keyword-input"
          />
        </div>
        <button type="submit" className="btn-primary px-6" id="search-submit-btn">
          <Search size={16} /> Tìm
        </button>
        <button
          type="button"
          onClick={() => setShowFilter(!showFilter)}
          className={`btn-outline px-4 relative ${hasActiveFilters ? 'border-wabi-red text-wabi-red' : ''}`}
          id="search-filter-toggle-btn"
        >
          <SlidersHorizontal size={16} />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-wabi-red" />
          )}
        </button>
      </form>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex gap-2 flex-wrap mb-4 items-center">
          <span className="text-wabi-muted text-xs">Đang lọc:</span>
          {filters.keyword && (
            <span className="badge badge-new flex items-center gap-1">
              "{filters.keyword}"
              <button onClick={() => { updateFilter('keyword', ''); setKeywordInput('') }} className="hover:text-wabi-red"><X size={11} /></button>
            </span>
          )}
          {filters.sort && (
            <span className="badge badge-sale flex items-center gap-1">
              {SORT_OPTIONS.find(s => s.value === filters.sort)?.label}
              <button onClick={() => updateFilter('sort', '')} className="hover:text-wabi-red"><X size={11} /></button>
            </span>
          )}
          {activeTagList.map(tag => (
            <span key={tag} className="badge badge-hot flex items-center gap-1">
              #{tag}
              <button onClick={() => toggleTag(tag)} className="hover:text-wabi-red"><X size={11} /></button>
            </span>
          ))}
          <button onClick={clearAllFilters} className="text-wabi-muted text-xs hover:text-wabi-red flex items-center gap-1 ml-2" id="clear-all-filters-btn">
            <X size={12} /> Xóa tất cả
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar */}
        {showFilter && (
          <aside className="w-64 flex-shrink-0 animate-fade-up" id="filter-sidebar">
            <div className="paper-old rounded-2xl p-5 sticky top-20 space-y-6">
              <h3 className="font-bold text-wabi-text font-serif flex items-center gap-2">
                <Filter size={16} className="text-wabi-red" /> Bộ Lọc
              </h3>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-wabi-secondary mb-2">Sắp Xếp</label>
                <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input-wabi text-sm" id="filter-sort-select">
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-wabi-secondary mb-2">Danh Mục</label>
                <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="input-wabi text-sm" id="filter-category-select">
                  <option value="">Tất cả danh mục</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-wabi-secondary mb-2">Khoảng Giá (VND)</label>
                <div className="space-y-2">
                  <input type="number" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} placeholder="Giá tối thiểu" className="input-wabi text-sm" id="filter-min-price" />
                  <input type="number" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} placeholder="Giá tối đa" className="input-wabi text-sm" id="filter-max-price" />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[50000, 100000, 200000, 500000].map(p => (
                    <button
                      key={p}
                      onClick={() => updateFilter('maxPrice', String(p))}
                      className={`text-xs px-2 py-1 rounded-lg border transition-all ${filters.maxPrice === String(p) ? 'border-wabi-red text-wabi-red bg-red-50' : 'border-wabi-border text-wabi-muted hover:border-wabi-red hover:text-wabi-red'}`}
                    >
                      {'<'}{(p / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-wabi-secondary mb-2">Thể Loại</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                        activeTagList.includes(tag)
                          ? 'border-wabi-red bg-red-50 text-wabi-red'
                          : 'border-wabi-border text-wabi-muted hover:border-wabi-green hover:text-wabi-green'
                      }`}
                      id={`tag-filter-${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-semibold text-wabi-secondary mb-2">Tình Trạng</label>
                <div className="space-y-2">
                  {[
                    { value: '', label: 'Tất cả' },
                    { value: 'available', label: 'Còn hàng' },
                    { value: 'outofstock', label: 'Hết hàng' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio" name="status" value={opt.value}
                        checked={filters.status === opt.value}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="accent-[#b5503a]"
                        id={`status-filter-${opt.value || 'all'}`}
                      />
                      <span className="text-sm text-wabi-muted group-hover:text-wabi-text">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="w-full btn-outline text-sm" id="sidebar-clear-btn">
                  <X size={14} /> Xóa Bộ Lọc
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="comic-card">
                  <div className="shimmer-loading w-full aspect-[2/3]" />
                  <div className="p-3 space-y-2">
                    <div className="shimmer-loading h-3 w-3/4 rounded" />
                    <div className="shimmer-loading h-4 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : comics.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {comics.map(comic => <ComicCard key={comic._id} comic={comic} />)}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8" id="search-pagination">
                  <button
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page <= 1}
                    className="btn-outline p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    id="pagination-prev"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => updateFilter('page', p)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                          filters.page === p
                            ? 'bg-wabi-red text-white shadow-warm'
                            : 'bg-white border border-wabi-border text-wabi-muted hover:text-wabi-text hover:border-wabi-red/30'
                        }`}
                        id={`pagination-page-${p}`}
                      >
                        {p}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => updateFilter('page', Math.min(pagination.totalPages, filters.page + 1))}
                    disabled={filters.page >= pagination.totalPages}
                    className="btn-outline p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    id="pagination-next"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-bold text-wabi-text font-serif mb-2">Không tìm thấy kết quả</h3>
              <p className="text-wabi-muted mb-6">Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc</p>
              <button onClick={clearAllFilters} className="btn-primary" id="no-results-clear-btn">
                Xóa Bộ Lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPage
