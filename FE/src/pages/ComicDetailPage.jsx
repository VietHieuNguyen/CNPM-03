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
import { Star, Package, TrendingUp, ShoppingCart, BookOpen, ChevronRight, AlertTriangle } from 'lucide-react'
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
      } catch {
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
    toast.success(`Đã thêm ${quantity} cuốn "${comic.title}" vào giỏ hàng!`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="shimmer-loading rounded-2xl aspect-[2/3]" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shimmer-loading h-6 rounded-xl" style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!comic) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">📖</div>
        <h2 className="text-2xl font-bold text-wabi-text font-serif mb-2">Không tìm thấy truyện</h2>
        <Link to="/" className="btn-primary mt-4 inline-flex">Về Trang Chủ</Link>
      </div>
    )
  }

  const finalPrice = comic.price * (1 - (comic.discount || 0) / 100)
  const isOutOfStock = comic.stock === 0
  const images = comic.images?.length > 0
    ? comic.images
    : ['https://placehold.co/400x560/e8ddd1/3d2b1a?text=No+Image']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-wabi-muted mb-6" aria-label="breadcrumb">
        <Link to="/" className="hover:text-wabi-red transition-colors">Trang Chủ</Link>
        <ChevronRight size={14} />
        {comic.category && (
          <>
            <Link to={`/search?category=${comic.category._id}`} className="hover:text-wabi-red transition-colors">
              {comic.category.name}
            </Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-wabi-text truncate max-w-xs">{comic.title}</span>
      </nav>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Image Swiper */}
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden paper border border-wabi-border">
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
                    className="w-full max-h-[560px] object-contain bg-wabi-bg2"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x560/e8ddd1/3d2b1a?text=No+Image' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

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
                    className="w-full aspect-[2/3] object-cover rounded-lg border-2 border-transparent hover:border-wabi-red transition-all"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x150/e8ddd1/3d2b1a?text=' + (idx + 1) }}
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
            {comic.isNew && <span className="badge badge-new">Mới</span>}
            {comic.isBestSeller && <span className="badge badge-hot">Bán Chạy</span>}
            {comic.discount > 0 && <span className="badge badge-sale">-{comic.discount}%</span>}
            {isOutOfStock && <span className="badge badge-out">Hết Hàng</span>}
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-wabi-text leading-tight">
            {comic.title}
          </h1>

          {/* Author, Publisher */}
          <div className="flex flex-wrap gap-4 text-sm text-wabi-muted">
            <span>Tác giả: <span className="text-wabi-text font-semibold">{comic.author}</span></span>
            {comic.publisher && <span>NXB: <span className="text-wabi-text font-semibold">{comic.publisher}</span></span>}
            {comic.publishYear && <span>Năm: {comic.publishYear}</span>}
            {comic.volumes > 1 && <span>{comic.volumes} tập</span>}
          </div>

          {/* Category */}
          {comic.category && (
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-wabi-green" />
              <span className="text-wabi-muted text-sm">Danh mục:</span>
              <Link
                to={`/search?category=${comic.category._id}`}
                className="text-wabi-green font-semibold text-sm hover:underline transition-colors"
                id="detail-category-link"
              >
                {comic.category.name}
              </Link>
            </div>
          )}

          {/* Tags */}
          {comic.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {comic.tags.map((tag) => (
                <Link key={tag} to={`/search?tags=${tag}`} className="badge badge-new text-xs hover:bg-wabi-green/20 transition-colors">
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
                    fill={s <= Math.round(comic.rating.avg) ? '#b89b5e' : 'transparent'}
                    className={s <= Math.round(comic.rating.avg) ? 'text-wabi-gold' : 'text-wabi-muted'}
                  />
                ))}
              </div>
              <span className="text-wabi-muted text-sm">
                {comic.rating.avg.toFixed(1)} ({comic.rating.count} đánh giá)
              </span>
            </div>
          )}

          {/* Price card */}
          <div className="paper-old rounded-2xl p-5 space-y-3">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-wabi-red">{formatPrice(finalPrice)}</span>
              {comic.discount > 0 && (
                <span className="text-wabi-muted text-lg line-through">{formatPrice(comic.price)}</span>
              )}
            </div>

            {/* Stock & Sold */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Package size={14} className={isOutOfStock ? 'text-wabi-red' : 'text-wabi-green'} />
                <span className="text-sm">
                  Tồn kho:{' '}
                  <span className={`font-bold ${isOutOfStock ? 'text-wabi-red' : 'text-wabi-green'}`}>
                    {isOutOfStock ? 'Hết hàng' : `${comic.stock} cuốn`}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-wabi-brown" />
                <span className="text-sm">
                  Đã bán: <span className="font-bold text-wabi-brown">{comic.sold?.toLocaleString()}</span>
                </span>
              </div>
            </div>

            {isOutOfStock && (
              <div className="flex items-center gap-2 text-wabi-red text-sm bg-red-50 rounded-xl px-3 py-2 border border-red-200">
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
            <div className="paper-old rounded-2xl p-5">
              <h3 className="font-bold text-wabi-text mb-3 font-serif flex items-center gap-2">
                <BookOpen size={16} className="text-wabi-green" /> Nội Dung
              </h3>
              <p className="text-wabi-secondary text-sm leading-relaxed">{comic.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Similar comics */}
      {similar.length > 0 && (
        <section id="similar-comics-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Truyện Tương Tự</h2>
            {comic.category && (
              <Link to={`/search?category=${comic.category._id}`} className="text-wabi-muted text-sm hover:text-wabi-red flex items-center gap-1 transition-colors">
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
