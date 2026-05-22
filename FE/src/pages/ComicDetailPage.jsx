import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { comicsAPI } from '../api'
import ComicCard from '../components/ComicCard'
import QuantityControl from '../components/QuantityControl'
import { Star, Package, TrendingUp, ShoppingCart, Tag, BookOpen, ChevronRight, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const ComicDetailPage = () => {
  const { slug } = useParams()
  const [comic, setComic] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)

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
      } catch (err) {
        toast.error('Không tìm thấy truyện')
      } finally {
        setLoading(false)
      }
    }
    fetchComic()
    window.scrollTo(0, 0)
  }, [slug])

  const handleAddToCart = () => {
    if (!comic) return
    toast.success(`Đã thêm ${quantity} cuốn "${comic.title}" vào giỏ hàng! 🛒`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="shimmer-loading rounded-2xl aspect-[2/3]" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`shimmer-loading h-${i === 0 ? 8 : 4} rounded-xl`} style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!comic) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="text-2xl font-bold text-manga-text mb-2">Không tìm thấy truyện</h2>
        <Link to="/" className="btn-primary mt-4 inline-flex">Về Trang Chủ</Link>
      </div>
    )
  }

  const finalPrice = comic.price * (1 - (comic.discount || 0) / 100)
  const isOutOfStock = comic.stock === 0
  const images = comic.images?.length > 0
    ? comic.images
    : ['https://placehold.co/400x560/1a0533/9b2dff?text=No+Image']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-manga-muted mb-6" aria-label="breadcrumb">
        <Link to="/" className="hover:text-manga-purple transition-colors">Trang Chủ</Link>
        <ChevronRight size={14} />
        {comic.category && (
          <>
            <Link to={`/search?category=${comic.category._id}`} className="hover:text-manga-purple transition-colors">
              {comic.category.name}
            </Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-manga-text truncate max-w-xs">{comic.title}</span>
      </nav>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Image Swiper */}
        <div className="space-y-3">
          {/* Main swiper */}
          <div className="rounded-2xl overflow-hidden glass border border-purple-900/30">
            <Swiper
              modules={[Navigation, Pagination, Thumbs]}
              navigation
              pagination={{ clickable: true }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              loop={images.length > 1}
              className="comic-detail-swiper"
              id="comic-main-swiper"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={img}
                    alt={`${comic.title} - ảnh ${idx + 1}`}
                    className="w-full max-h-[560px] object-contain bg-manga-bg"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x560/1a0533/9b2dff?text=No+Image' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Thumbnails (chỉ hiện khi có >1 hình) */}
          {images.length > 1 && (
            <Swiper
              modules={[Thumbs]}
              onSwiper={setThumbsSwiper}
              spaceBetween={8}
              slidesPerView={Math.min(images.length, 5)}
              watchSlidesProgress
              className="cursor-pointer"
              id="comic-thumb-swiper"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={img}
                    alt={`thumb ${idx + 1}`}
                    className="w-full aspect-[2/3] object-cover rounded-lg border-2 border-transparent hover:border-manga-purple transition-all"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x150/1a0533/9b2dff?text=' + (idx+1) }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 animate-fade-up">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {comic.isNew && <span className="badge badge-new">✨ Mới</span>}
            {comic.isBestSeller && <span className="badge badge-hot">🔥 Bán Chạy</span>}
            {comic.discount > 0 && <span className="badge badge-sale">-{comic.discount}%</span>}
            {isOutOfStock && <span className="badge badge-out">⚠️ Hết Hàng</span>}
          </div>

          {/* Title */}
          <h1 className="font-title text-2xl md:text-3xl font-black text-manga-text leading-tight">
            {comic.title}
          </h1>

          {/* Author, Publisher */}
          <div className="flex flex-wrap gap-4 text-sm text-manga-muted">
            <span>✍️ Tác giả: <span className="text-manga-text font-semibold">{comic.author}</span></span>
            {comic.publisher && <span>🏢 NXB: <span className="text-manga-text font-semibold">{comic.publisher}</span></span>}
            {comic.publishYear && <span>📅 {comic.publishYear}</span>}
            {comic.volumes > 1 && <span>📚 {comic.volumes} tập</span>}
          </div>

          {/* Category */}
          {comic.category && (
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-manga-cyan" />
              <span className="text-manga-muted text-sm">Danh mục:</span>
              <Link
                to={`/search?category=${comic.category._id}`}
                className="text-manga-cyan font-semibold text-sm hover:text-manga-purple transition-colors"
                id={`detail-category-link`}
              >
                {comic.category.name}
              </Link>
            </div>
          )}

          {/* Tags */}
          {comic.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {comic.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?tags=${tag}`}
                  className="badge badge-new text-xs hover:scale-105 transition-transform"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Rating */}
          {comic.rating?.count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(comic.rating.avg) ? '#ffd700' : 'transparent'}
                    className={s <= Math.round(comic.rating.avg) ? 'text-yellow-400' : 'text-manga-muted'}
                  />
                ))}
              </div>
              <span className="text-manga-muted text-sm">
                {comic.rating.avg.toFixed(1)} ({comic.rating.count} đánh giá)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-manga-pink">{formatPrice(finalPrice)}</span>
              {comic.discount > 0 && (
                <span className="text-manga-muted text-lg line-through">{formatPrice(comic.price)}</span>
              )}
            </div>

            {/* Stock & Sold */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Package size={14} className={isOutOfStock ? 'text-red-400' : 'text-manga-cyan'} />
                <span className="text-sm">
                  Tồn kho:{' '}
                  <span className={`font-bold ${isOutOfStock ? 'text-red-400' : 'text-manga-cyan'}`}>
                    {isOutOfStock ? 'Hết hàng' : `${comic.stock} cuốn`}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-manga-purple" />
                <span className="text-sm">
                  Đã bán: <span className="font-bold text-manga-purple">{comic.sold?.toLocaleString()}</span>
                </span>
              </div>
            </div>

            {/* Out of stock warning */}
            {isOutOfStock && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-xl px-3 py-2 border border-red-400/20">
                <AlertTriangle size={14} />
                Sản phẩm hiện đã hết hàng. Vui lòng quay lại sau!
              </div>
            )}
          </div>

          {/* Quantity + Add to cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 flex-wrap">
              <QuantityControl value={quantity} onChange={setQuantity} min={1} max={comic.stock} />
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 justify-center py-3"
                id="detail-add-to-cart-btn"
              >
                <ShoppingCart size={18} /> Thêm Vào Giỏ Hàng
              </button>
            </div>
          )}

          {/* Description */}
          {comic.description && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-bold text-manga-text mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-manga-purple" /> Nội Dung
              </h3>
              <p className="text-manga-muted text-sm leading-relaxed">{comic.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Similar comics */}
      {similar.length > 0 && (
        <section id="similar-comics-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">🔗 Truyện Tương Tự</h2>
            {comic.category && (
              <Link to={`/search?category=${comic.category._id}`} className="text-manga-muted text-sm hover:text-manga-purple flex items-center gap-1 transition-colors">
                Xem thêm <ChevronRight size={14} />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {similar.map((c) => <ComicCard key={c._id} comic={c} />)}
          </div>
        </section>
      )}
    </div>
  )
}

export default ComicDetailPage
