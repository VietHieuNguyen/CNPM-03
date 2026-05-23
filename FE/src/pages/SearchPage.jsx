import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { comicsAPI, categoriesAPI } from '../api'
import ComicCard from '../components/ComicCard'
import { IconFolder, IconBook, IconFilter, IconX } from '../components/Icons'

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
      if (filters.page === 1) {
        setComics(res.data.data.comics)
      } else {
        setComics(prev => {
          // Prevent duplicates by checking if the comic ID already exists
          const existingIds = new Set(prev.map(c => c._id))
          const newComics = res.data.data.comics.filter(c => !existingIds.has(c._id))
          return [...prev, ...newComics]
        })
      }
      setPagination(res.data.data.pagination)
      setSearchParams(params)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters.keyword, filters.category, filters.minPrice, filters.maxPrice, filters.tags, filters.status, filters.sort, filters.page])

  useEffect(() => { fetchComics() }, [fetchComics])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && filters.page < pagination.totalPages) {
          setFilters(prev => ({ ...prev, page: prev.page + 1 }))
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const sentinel = document.getElementById('infinite-scroll-sentinel')
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [loading, filters.page, pagination.totalPages])

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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title text-2xl mb-2 font-serif">Tìm Kiếm & Khám Phá</h1>
        {pagination.total > 0 && (
          <p className="text-wabi-muted text-sm mt-2">Tìm thấy <span className="text-[#683520] font-bold">{pagination.total}</span> kết quả</p>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6" id="search-form">
        <div className="relative flex-1">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Tìm tên truyện, tác giả..."
            className="input-wabi pl-4"
            id="search-keyword-input"
          />
        </div>
        <button type="submit" className="bg-[#683520] text-white text-sm font-bold px-6 py-2.5 rounded-[10px] border border-[#683520] hover:bg-[#522918] hover:border-[#522918] transition-all duration-300 cursor-pointer shadow-warm" id="search-submit-btn">
          Tìm
        </button>
        <button
          type="button"
          onClick={() => setShowFilter(!showFilter)}
          className={`border-2 px-6 py-2.5 rounded-[10px] text-sm font-bold transition-all duration-300 relative cursor-pointer ${hasActiveFilters ? 'border-[#683520] text-[#683520]' : 'border-[#d9cbb8] text-[#6b5744]'}`}
          id="search-filter-toggle-btn"
        >
          {showFilter ? 'Đóng bộ lọc' : 'Bộ lọc'}
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#683520]" />
          )}
        </button>
      </form>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex gap-2 flex-wrap mb-4 items-center">
          <span className="text-wabi-muted text-xs">Đang lọc:</span>
          {filters.keyword && (
            <span className="badge badge-new flex items-center gap-1.5">
              "{filters.keyword}"
              <button onClick={() => { updateFilter('keyword', ''); setKeywordInput('') }} className="hover:text-[#683520] font-bold cursor-pointer"><IconX className="w-2.5 h-2.5" /></button>
            </span>
          )}
          {filters.sort && (
            <span className="badge badge-sale flex items-center gap-1.5">
              {SORT_OPTIONS.find(s => s.value === filters.sort)?.label}
              <button onClick={() => updateFilter('sort', '')} className="hover:text-[#683520] font-bold cursor-pointer"><IconX className="w-2.5 h-2.5" /></button>
            </span>
          )}
          {activeTagList.map(tag => (
            <span key={tag} className="badge badge-hot flex items-center gap-1.5">
              #{tag}
              <button onClick={() => toggleTag(tag)} className="hover:text-[#683520] font-bold cursor-pointer"><IconX className="w-2.5 h-2.5" /></button>
            </span>
          ))}
          <button onClick={clearAllFilters} className="text-wabi-muted text-xs hover:text-[#683520] flex items-center gap-1 ml-2 cursor-pointer font-bold" id="clear-all-filters-btn">
            <IconX className="w-2.5 h-2.5" /> Xóa tất cả
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        {showFilter && (
          <aside className="w-full md:w-64 flex-shrink-0 animate-fade-up" id="filter-sidebar">
            <div className="paper-old rounded-2xl p-5 sticky top-20 space-y-6">
              <h3 className="font-bold text-wabi-text font-serif flex items-center gap-2">
                <IconFilter className="w-4 h-4 text-[#683520]" /> Bộ Lọc
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
                      className={`text-xs px-2 py-1 rounded-lg border transition-all cursor-pointer ${filters.maxPrice === String(p) ? 'border-[#683520] text-[#683520] bg-orange-50/50' : 'border-[#d9cbb8] text-wabi-muted hover:border-[#683520] hover:text-[#683520]'}`}
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
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        activeTagList.includes(tag)
                          ? 'border-[#683520] bg-[#fcfaf7] text-[#683520]'
                          : 'border-[#d9cbb8] text-wabi-muted hover:border-[#683520] hover:text-[#683520]'
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
                        className="accent-[#683520]"
                        id={`status-filter-${opt.value || 'all'}`}
                      />
                      <span className="text-sm text-wabi-muted group-hover:text-wabi-text">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="w-full border-2 border-[#683520] text-[#683520] text-sm font-bold py-2 rounded-lg hover:bg-[#683520] hover:text-white transition-all cursor-pointer" id="sidebar-clear-btn">
                  <IconX className="w-2.5 h-2.5 inline-block mr-1" /> Xóa Bộ Lọc
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Results */}
        <div className="flex-1">
          {loading && filters.page === 1 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {comics.map(comic => <ComicCard key={comic._id} comic={comic} />)}
              </div>

              {/* Sentinel for infinite scroll */}
              <div id="infinite-scroll-sentinel" className="w-full flex flex-col items-center justify-center mt-10 py-6 border-t border-[#d9cbb8]/30">
                {loading ? (
                  <div className="flex items-center gap-2 text-[#683520] text-sm font-semibold animate-pulse">
                    <div className="w-5 h-5 border-2 border-t-transparent border-[#683520] rounded-full animate-spin" />
                    Đang tải thêm truyện...
                  </div>
                ) : filters.page < pagination.totalPages ? (
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="px-6 py-2.5 border-2 border-[#d9cbb8] text-[#6b5744] hover:text-[#683520] hover:border-[#683520] transition-all duration-300 rounded-[10px] text-xs font-bold cursor-pointer bg-white shadow-sm"
                  >
                    Tải thêm truyện
                  </button>
                ) : (
                  <p className="text-wabi-muted text-xs font-semibold font-serif">Đã hiển thị toàn bộ truyện theo bộ lọc</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <IconBook className="w-16 h-16 text-wabi-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#3d2b1a] font-serif mb-2">Không tìm thấy kết quả</h3>
              <p className="text-wabi-muted mb-6">Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc</p>
              <button onClick={clearAllFilters} className="bg-[#683520] text-white text-sm font-bold px-6 py-2.5 rounded-lg border border-[#683520] hover:bg-[#522918] hover:border-[#522918] transition-all duration-300 cursor-pointer" id="no-results-clear-btn">
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
