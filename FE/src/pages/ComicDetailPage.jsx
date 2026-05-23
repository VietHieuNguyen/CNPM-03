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
import { useCart } from '../context/CartContext'
import { IconFolder, IconBook, IconBox, IconTrendingUp, IconStar, IconWarning } from '../components/Icons'
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
      } catch { toast.error('Không tìm thấy truyện') }
      finally { setLoading(false) }
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
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8 xl:gap-14">
          <div className="shimmer-loading rounded-[28px] aspect-[2/3]" />
          <div className="space-y-6">
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
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-32 text-center">
        <IconBook className="w-16 h-16 text-wabi-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-wabi-text font-serif mb-2">Không tìm thấy truyện</h2>
        <Link to="/" className="btn-primary mt-4 inline-flex">Về Trang Chủ</Link>
      </div>
    )
  }

  const finalPrice = comic.price * (1 - (comic.discount || 0) / 100)
  const isOutOfStock = comic.stock === 0
  const images = comic.images?.length > 0 ? comic.images : ['https://placehold.co/400x560/e8ddd1/3d2b1a?text=No+Image']

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-16 sm:pt-20 pb-24 sm:pb-32">

      {/* ===== BREADCRUMB ===== */}
      <nav
        className="flex items-center gap-2 text-sm text-wabi-muted mb-10 sm:mb-14 flex-wrap"
        aria-label="breadcrumb"
      >
        <Link to="/" className="hover:text-wabi-red transition-colors">Trang Chủ</Link>
        <span className="text-xs">→</span>
        {comic.category && (
          <>
            <Link to={`/search?category=${comic.category._id}`} className="hover:text-wabi-red transition-colors">{comic.category.name}</Link>
            <span className="text-xs">→</span>
          </>
        )}
        <span className="text-wabi-text truncate max-w-[200px] sm:max-w-xs">{comic.title}</span>
      </nav>

      {/* ===== MAIN GRID: IMAGE + INFO ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-10 xl:gap-16 items-start">

        {/* Image Swiper */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[28px] bg-white border border-wabi-border/60 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
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
                    className="w-full h-[420px] sm:h-[620px] object-cover bg-[#f8f5f1] transition-transform duration-700 hover:scale-[1.02]"
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
                    className="w-full aspect-[2/3] object-cover rounded-2xl border-2 border-transparent hover:border-wabi-red hover:scale-[1.03] transition-all duration-300"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x150/e8ddd1/3d2b1a?text=' + (idx + 1) }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6 animate-fade-up">

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {comic.isNew && <span className="badge badge-new">Mới</span>}
            {comic.isBestSeller && <span className="badge badge-hot">Bán Chạy</span>}
            {comic.discount > 0 && <span className="badge badge-sale">-{comic.discount}%</span>}
            {isOutOfStock && <span className="badge badge-out">Hết Hàng</span>}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-wabi-text">
            {comic.title}
          </h1>

          {/* Meta info card */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-wabi-muted bg-[#faf8f5] border border-wabi-border/40 rounded-2xl p-5">
            <span>Tác giả: <span className="text-wabi-text font-semibold">{comic.author}</span></span>
            {comic.publisher && <span>NXB: <span className="text-wabi-text font-semibold">{comic.publisher}</span></span>}
            {comic.publishYear && <span>Năm: {comic.publishYear}</span>}
            {comic.volumes > 1 && <span>{comic.volumes} tập</span>}
          </div>

          {/* Category */}
          {comic.category && (
            <div className="flex items-center gap-2">
              <IconFolder className="w-3.5 h-3.5 text-wabi-green" />
              <span className="text-wabi-muted text-sm">Danh mục:</span>
              <Link
                to={`/search?category=${comic.category._id}`}
                className="text-wabi-green font-semibold text-sm hover:underline"
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
                <Link
                  key={tag}
                  to={`/search?tags=${tag}`}
                  className="badge badge-new text-xs hover:bg-wabi-green/20 transition-colors"
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
                  <IconStar
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(comic.rating.avg) ? 'text-wabi-gold' : 'text-wabi-muted'}`}
                    filled={s <= Math.round(comic.rating.avg)}
                  />
                ))}
              </div>
              <span className="text-wabi-muted text-sm">
                {comic.rating.avg.toFixed(1)} ({comic.rating.count} đánh giá)
              </span>
            </div>
          )}

          {/* Price card */}
          <div className="rounded-[28px] bg-gradient-to-br from-[#fffaf5] to-[#f7efe7] border border-[#eadfd2] p-6 shadow-[0_10px_30px_rgba(61,43,26,0.08)] space-y-5">
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-4xl font-black tracking-tight text-wabi-red">
                {formatPrice(finalPrice)}
              </span>
              {comic.discount > 0 && (
                <span className="text-wabi-muted text-base sm:text-lg line-through">
                  {formatPrice(comic.price)}
                </span>
              )}
            </div>

            <div className="flex gap-4 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-1.5">
                <IconBox className={`w-3.5 h-3.5 ${isOutOfStock ? 'text-wabi-red' : 'text-wabi-green'}`} />
                <span className="text-sm">
                  Tồn kho: <span className={`font-bold ${isOutOfStock ? 'text-wabi-red' : 'text-wabi-green'}`}>
                    {isOutOfStock ? 'Hết hàng' : `${comic.stock} cuốn`}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconTrendingUp className="w-3.5 h-3.5 text-wabi-brown" />
                <span className="text-sm">
                  Đã bán: <span className="font-bold text-wabi-brown">{comic.sold?.toLocaleString()}</span>
                </span>
              </div>
            </div>

            {isOutOfStock && (
              <div className="flex items-center gap-2 text-wabi-red text-sm bg-red-50 rounded-xl px-3 py-2 border border-red-200">
                <IconWarning className="w-3.5 h-3.5 flex-shrink-0" /> Sản phẩm hiện đã hết hàng. Vui lòng quay lại sau!
              </div>
            )}
          </div>

          {/* Add to cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <QuantityControl value={quantity} onChange={setQuantity} min={1} max={comic.stock} />
              <button
                onClick={handleAddToCart}
                id="detail-add-to-cart-btn"
                className="
                  flex-1 h-14 rounded-2xl bg-wabi-red text-white font-bold text-[15px]
                  shadow-lg shadow-red-500/20 hover:-translate-y-0.5 hover:shadow-xl
                  transition-all duration-300 flex items-center justify-center cursor-pointer
                "
              >
                Thêm Vào Giỏ Hàng
              </button>
            </div>
          )}

          {/* Description */}
          {comic.description && (
            <div className="rounded-[28px] bg-white border border-wabi-border/50 p-6 shadow-sm">
              <h3 className="font-bold text-wabi-text mb-3 font-serif flex items-center gap-2">
                <IconBook className="w-4 h-4 text-wabi-green" /> Nội Dung
              </h3>
              <p className="text-wabi-secondary text-sm leading-relaxed">{comic.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== SIMILAR COMICS ===== */}
      {similar.length > 0 && (
        <section className="mt-24 sm:mt-32 xl:mt-36" id="similar-comics-section">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Truyện Tương Tự</h2>
            {comic.category && (
              <Link
                to={`/search?category=${comic.category._id}`}
                className="text-wabi-muted text-sm hover:text-wabi-red flex items-center gap-1 transition-colors"
              >
                Xem thêm <span className="font-serif">→</span>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
            {similar.map((c) => <ComicCard key={c._id} comic={c} />)}
          </div>
        </section>
      )}
    </div>
  )
}

export default ComicDetailPage
