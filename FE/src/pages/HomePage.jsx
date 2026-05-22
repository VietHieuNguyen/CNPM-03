import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { comicsAPI, categoriesAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import ComicCard from '../components/ComicCard'
import { Sparkles, BookOpen, TrendingUp, Tag, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const SectionTitle = ({ title, linkTo, emoji }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="section-title">
      {emoji && <span className="text-xl">{emoji}</span>}
      {title}
    </h2>
    {linkTo && (
      <Link to={linkTo} className="flex items-center gap-1 text-wabi-muted hover:text-wabi-red text-sm font-medium transition-colors" id={`section-viewall-${title.replace(/\s/g, '-')}`}>
        Xem tất cả <ArrowRight size={14} />
      </Link>
    )}
  </div>
)

const SkeletonCard = () => (
  <div className="comic-card">
    <div className="shimmer-loading w-full aspect-[2/3]" />
    <div className="p-3 space-y-2">
      <div className="shimmer-loading h-3 w-3/4 rounded" />
      <div className="shimmer-loading h-4 w-full rounded" />
      <div className="shimmer-loading h-3 w-1/2 rounded" />
    </div>
  </div>
)

const HomePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [newComics, setNewComics] = useState([])
  const [bestseller, setBestseller] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featRes, newRes, bestRes, catRes] = await Promise.all([
          comicsAPI.featured(),
          comicsAPI.newComics(),
          comicsAPI.bestseller(),
          categoriesAPI.list(),
        ])
        setFeatured(featRes.data.data.comics)
        setNewComics(newRes.data.data.comics)
        setBestseller(bestRes.data.data.comics)
        setCategories(catRes.data.data.categories)
      } catch (err) {
        toast.error('Không thể tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ===== HERO ===== */}
      <section className="mb-16">
        <div className="relative rounded-2xl overflow-hidden paper-old p-8 md:p-14 border-2 border-dashed border-wabi-border">
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-wabi-red/40 rounded-tl-md" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-wabi-red/40 rounded-tr-md" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-wabi-red/40 rounded-bl-md" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-wabi-red/40 rounded-br-md" />

          <div className="relative z-10 max-w-xl">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-wabi-green to-wabi-green-light flex items-center justify-center text-xl font-bold text-white shadow-warm">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-wabi-muted text-sm">Chào mừng trở lại</p>
                    <p className="text-wabi-text font-bold text-lg">{user.name}</p>
                  </div>
                </div>
                <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-wabi-text leading-tight">
                  Khám phá
                  <br />
                  <span className="gradient-text">thế giới truyện tranh</span>
                </h1>
                <p className="text-wabi-secondary mb-6 leading-relaxed">
                  Hàng nghìn đầu truyện manga, manhwa, manhua chất lượng cao. 
                  Cập nhật liên tục, giao hàng nhanh toàn quốc!
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link to="/search" className="btn-primary" id="hero-explore-btn">
                    <BookOpen size={16} /> Khám Phá Ngay
                  </Link>
                  <Link to="/search?sort=bestseller" className="btn-outline" id="hero-bestseller-btn">
                    <TrendingUp size={16} /> Bán Chạy
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="stamp mb-4">Thiên đường truyện tranh</div>
                <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-wabi-text leading-tight">
                  <span className="gradient-text">MangaStore</span>
                  <br />
                  Xứ Sở Manga
                </h1>
                <p className="text-wabi-secondary mb-6 leading-relaxed">
                  Hàng nghìn đầu truyện manga, manhwa, manhua chất lượng cao. 
                  Đăng nhập để nhận ưu đãi độc quyền dành cho thành viên!
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link to="/register" className="btn-primary" id="hero-register-btn">
                    <Sparkles size={16} /> Tham Gia Miễn Phí
                  </Link>
                  <Link to="/search" className="btn-outline-green" id="hero-browse-btn">
                    <BookOpen size={16} /> Xem Truyện
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      {categories.length > 0 && (
        <section className="mb-14">
          <SectionTitle emoji="📂" title="Danh Mục" linkTo="/search" />
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/search?category=${cat._id}`}
                className="flex items-center gap-2 bg-white border border-wabi-border px-4 py-2 rounded-xl text-sm font-semibold text-wabi-secondary hover:text-wabi-red hover:border-wabi-red/30 hover:shadow-warm transition-all"
                id={`category-chip-${cat.slug}`}
              >
                <Tag size={14} />
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== FEATURED ===== */}
      <section className="mb-14">
        <SectionTitle emoji="🔖" title="Khuyến Mãi Nổi Bật" linkTo="/search?isFeatured=true" />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured.slice(0, 5).map((comic) => (
              <ComicCard key={comic._id} comic={comic} />
            ))}
          </div>
        ) : (
          <p className="text-wabi-muted text-center py-8 font-serif italic">Chưa có truyện nổi bật</p>
        )}
      </section>

      {/* ===== NEW ===== */}
      <section className="mb-14">
        <SectionTitle emoji="🌱" title="Mới Nhất" linkTo="/search?sort=newest" />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : newComics.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {newComics.slice(0, 5).map((comic) => (
              <ComicCard key={comic._id} comic={comic} />
            ))}
          </div>
        ) : (
          <p className="text-wabi-muted text-center py-8 font-serif italic">Chưa có truyện mới</p>
        )}
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="mb-14">
        <div className="paper-old rounded-2xl p-8 text-center stitch-border relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-3xl mb-3">🎋</div>
            <h2 className="font-serif text-2xl font-bold text-wabi-text mb-2">Ưu Đãi Thành Viên Mới</h2>
            <p className="text-wabi-secondary mb-4 max-w-md mx-auto text-sm">
              Đăng ký hôm nay và nhận ngay voucher giảm 20% cho đơn hàng đầu tiên!
            </p>
            {!user && (
              <Link to="/register" className="btn-primary" id="promo-register-btn">
                <Sparkles size={16} /> Nhận Ưu Đãi Ngay
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ===== BESTSELLER ===== */}
      <section className="mb-14">
        <SectionTitle emoji="🏆" title="Bán Chạy Nhất" linkTo="/search?sort=bestseller" />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : bestseller.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bestseller.slice(0, 5).map((comic, idx) => (
              <div key={comic._id} className="relative">
                {idx < 3 && (
                  <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-gradient-to-br from-wabi-gold to-wabi-sand flex items-center justify-center text-xs font-black text-white shadow-warm">
                    {idx + 1}
                  </div>
                )}
                <ComicCard comic={comic} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-wabi-muted text-center py-8 font-serif italic">Chưa có dữ liệu bán chạy</p>
        )}
      </section>
    </div>
  )
}

export default HomePage
