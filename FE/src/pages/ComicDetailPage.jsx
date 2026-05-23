import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { comicsAPI } from '../api'
import ComicCard from '../components/ComicCard'
import QuantityControl from '../components/QuantityControl'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

const formatPrice = (price) => {
  const formatted = new Intl.NumberFormat('vi-VN').format(price)
  return `${formatted}đ`
}

const ComicDetailPage = () => {
  const { slug } = useParams()
  const [comic, setComic] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchComic = async () => {
      setLoading(true)
      setQuantity(1)
      try {
        const res = await comicsAPI.detail(slug)
        const data = res.data.data.comic
        setComic(data)
        if (data.category?._id) {
          const simRes = await comicsAPI.similar(data.category._id, data._id)
          setSimilar(simRes.data.data.comics)
        }
      } catch {
        toast.error('Không tìm thấy truyện')
      } finally {
        setLoading(false)
      }
    }
    fetchComic()
    window.scrollTo(0, 0)
  }, [slug])

  const handleAddToCart = async () => {
    if (!comic) return
    await addToCart(comic._id, quantity)
  }

  if (loading) {
    return (
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-20 xl:px-28 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-10 xl:gap-16">
          <div className="shimmer-loading rounded-2xl aspect-[3/4]" />
          <div className="space-y-6">
            <div className="shimmer-loading h-4 w-1/4 rounded" />
            <div className="shimmer-loading h-10 w-3/4 rounded" />
            <div className="shimmer-loading h-6 w-1/2 rounded" />
            <div className="shimmer-loading h-32 w-full rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!comic) {
    return (
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-20 xl:px-28 py-32 text-center">
        <h2 className="text-2xl font-bold text-[#683520] font-serif mb-2">Không tìm thấy truyện</h2>
        <Link to="/" className="inline-flex items-center justify-center min-h-[50px] px-8 bg-[#683520] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#522918] transition-all mt-4">
          Về Trang Chủ
        </Link>
      </div>
    )
  }

  const finalPrice = comic.price * (1 - (comic.discount || 0) / 100)
  const isOutOfStock = comic.stock === 0
  const images = comic.images?.length > 0 ? comic.images : ['https://placehold.co/400x560/e8ddd1/3d2b1a?text=No+Image']

  // Split description to highlight the first sentence as a quote
  const descParts = comic.description ? comic.description.split(/[.!?]+/) : []
  const highlightQuote = descParts.length > 0 ? descParts[0].trim() + '.' : ''
  const remainingDesc = comic.description ? comic.description.substring(highlightQuote.length).trim() : ''

  return (
    <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-20 xl:px-28 pt-10 sm:pt-14 pb-24 sm:pb-32 bg-[#FEFEFE]">
      {/* ===== BREADCRUMB ===== */}
      <nav className="flex items-center gap-2 text-xs font-bold text-wabi-muted mb-10 flex-wrap" aria-label="breadcrumb">
        <Link to="/" className="hover:text-[#683520] transition-colors">Trang chủ</Link>
        <span className="text-gray-400">/</span>
        {comic.category && (
          <>
            <Link to={`/search?category=${comic.category._id}`} className="hover:text-[#683520] transition-colors">
              {comic.category.name === "Góc đọc" ? "Góc đọc" : comic.category.name}
            </Link>
            <span className="text-gray-400">/</span>
          </>
        )}
        <span className="text-[#3d2b1a] truncate max-w-[200px] sm:max-w-xs">{comic.title}</span>
      </nav>

      {/* ===== PRODUCT CORE LAYOUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[45%_50%] gap-10 xl:gap-16 items-start justify-between">
        
        {/* Left Side: Swiper & Tags */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-wabi-border/30 bg-[#fbfaf8] relative aspect-[3/4]">
            <Swiper
              modules={[Navigation]}
              navigation
              loop={images.length > 1}
              className="comic-detail-swiper h-full"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx} className="h-full">
                  <img
                    src={img}
                    alt={`${comic.title} - ảnh ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x560/e8ddd1/3d2b1a?text=No+Image' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Elegant Category & Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {comic.category && (
              <span className="bg-[#f0e6df] text-[#6b5744] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full">
                {comic.category.name.toUpperCase()}
              </span>
            )}
            {comic.tags?.map((tag) => (
              <span key={tag} className="bg-[#f6f1eb] text-wabi-muted px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full">
                {tag.toUpperCase()}
              </span>
            ))}
            {/* Soft spiritual fallback tag if none exists */}
            {(!comic.tags || comic.tags.length === 0) && (
              <>
                <span className="bg-[#f6f1eb] text-wabi-muted px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  DRAMA
                </span>
                <span className="bg-[#f6f1eb] text-wabi-muted px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  SPIRITUAL
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Info & Purchase */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-black leading-tight tracking-tight text-[#3d2b1a]">
              {comic.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-wabi-muted font-bold">
              <span>Tác giả: <span className="text-[#3d2b1a]">{comic.author || 'Arata Isuzuki'}</span></span>
              <span className="text-gray-300">|</span>
              <span className="text-[#b89b5e] flex items-center gap-1">
                ★ {comic.rating?.avg ? comic.rating.avg.toFixed(1) : '4.8'} 
                <span className="text-wabi-muted font-normal">({comic.rating?.count || '128'} đánh giá)</span>
              </span>
            </div>
          </div>

          {/* Custom Highlight Quote */}
          {highlightQuote && (
            <div className="border-l-2 border-[#683520] pl-5 py-1">
              <blockquote className="font-serif italic text-sm sm:text-base text-[#6b5744] leading-relaxed">
                "{highlightQuote}"
              </blockquote>
            </div>
          )}

          {/* Description Paragraph */}
          {remainingDesc && (
            <p className="text-xs sm:text-sm text-wabi-secondary leading-relaxed">
              {remainingDesc}
            </p>
          )}

          {/* Specification Grid Table */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-6 border-t border-b border-[#eadfd2]/60 text-xs sm:text-sm">
            <div>
              <span className="text-wabi-muted block">Mã sản phẩm</span>
              <span className="font-bold text-[#3d2b1a]">{`KOM-${comic._id.substring(19).toUpperCase()}`}</span>
            </div>
            <div>
              <span className="text-wabi-muted block">Dạng bìa</span>
              <span className="font-bold text-[#3d2b1a]">{comic.publisher === 'Bìa cứng' ? 'Bìa cứng, giấy lụa' : 'Bìa mềm, giấy mỹ thuật'}</span>
            </div>
            <div>
              <span className="text-wabi-muted block">Ngôn ngữ</span>
              <span className="font-bold text-[#3d2b1a]">Tiếng Việt</span>
            </div>
            <div>
              <span className="text-wabi-muted block">Số trang</span>
              <span className="font-bold text-[#3d2b1a]">{comic.publishYear ? `${comic.publishYear} trang` : '216 trang'}</span>
            </div>
          </div>

          {/* Beige Action & Price Box */}
          <div className="bg-[#faf6f2] border border-[#eadfd2]/60 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wabi-muted block">ĐƠN GIÁ NIÊM YẾT</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#683520]">
                    {formatPrice(finalPrice)}
                  </span>
                  {comic.discount > 0 && (
                    <span className="text-xs text-wabi-muted line-through">
                      {formatPrice(comic.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selection Pill */}
              {!isOutOfStock && (
                <div className="bg-white border border-[#eadfd2] rounded-full px-3 py-1 flex items-center shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-wabi-muted hover:text-[#683520] font-bold text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-black text-sm text-[#3d2b1a]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(comic.stock, q + 1))}
                    className="w-8 h-8 flex items-center justify-center text-wabi-muted hover:text-[#683520] font-bold text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isOutOfStock ? (
                <div className="w-full text-center bg-gray-100 border border-gray-200 text-gray-400 py-4 font-bold text-xs uppercase tracking-wider rounded-none">
                  HẾT HÀNG / OUT OF STOCK
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 min-h-[50px] bg-[#683520] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#522918] transition-all flex items-center justify-center gap-2 cursor-pointer rounded-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={() => toast.success('Mở bản đọc thử... 📖')}
                    className="flex-1 min-h-[50px] bg-white border border-[#683520] text-[#683520] font-bold text-xs uppercase tracking-widest hover:bg-[#faf6f2] transition-all flex items-center justify-center cursor-pointer rounded-none"
                  >
                    Đọc thử ngay
                  </button>
                </>
              )}
            </div>

            {/* Guarantees */}
            <div className="flex items-center gap-6 pt-2 border-t border-[#eadfd2]/40 text-xs text-wabi-muted font-bold">
              <span className="flex items-center gap-1.5">🚚 Giao nhanh 24h</span>
              <span className="flex items-center gap-1.5">🛡️ Chính hãng 100%</span>
              <span className="flex items-center gap-1.5">📦 Còn {comic.stock} cuốn</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RELATED COMICS ===== */}
      {similar.length > 0 && (
        <section className="mt-28" id="similar-comics-section">
          <div className="flex items-center justify-between mb-8 border-b border-wabi-border/40 pb-5 relative">
            <h2 className="font-serif text-2xl font-black text-[#683520]">
              Tác phẩm tương tự
            </h2>
            <Link
              to={`/search?category=${comic.category?._id}`}
              className="text-xs font-bold uppercase tracking-wider text-[#683520] hover:text-[#522918] transition-colors"
            >
              Xem tất cả
            </Link>
            <div className="absolute bottom-[-1.5px] left-0 w-20 h-[3px] bg-[#683520]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {similar.slice(0, 4).map((c) => (
              <ComicCard key={c._id} comic={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ComicDetailPage
