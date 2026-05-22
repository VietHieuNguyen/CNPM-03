import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { comicsAPI, categoriesAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import ComicCard from '../components/ComicCard'
import { ChevronRight, Flame, Sparkles, BookOpen, TrendingUp, Tag, ArrowRight, LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

const SectionTitle = ({ icon: Icon, title, color = 'text-manga-purple', linkTo, emoji }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="section-title" style={{ color }}>
      {emoji && <span>{emoji}</span>}
      {title}
    </h2>
    {linkTo && (
      <Link to={linkTo} className="flex items-center gap-1 text-manga-muted hover:text-manga-purple text-sm transition-colors" id={`section-viewall-${title.replace(/\s/g,'-')}`}>
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
  const { user, logout } = useAuth()
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

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="relative rounded-3xl overflow-hidden glass border border-purple-900/30 p-8 md:p-14">
          {/* Background gradients */}
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-purple-900/40 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-pink-900/20 to-transparent pointer-events-none" />

          {/* Animated circles */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-600/15 blur-3xl animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

          <div className="relative z-10 max-w-xl">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-xl font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-manga-muted text-sm">Chào mừng trở lại 🎌</p>
                    <p className="text-manga-text font-bold text-lg">{user.name}</p>
                  </div>
                </div>
                <h1 className="font-title text-3xl md:text-5xl font-black mb-4">
                  <span className="gradient-text">Khám phá</span>
                  <br />
                  <span className="text-manga-text">thế giới truyện tranh</span>
                </h1>
                <p className="text-manga-muted mb-6 leading-relaxed">
                  Hàng nghìn đầu truyện manga, manhwa, manhua chất lượng cao. 
                  Cập nhật liên tục, giao hàng nhanh toàn quốc! 📚
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
                <div className="badge badge-new mb-4">✨ Thiên đường truyện tranh</div>
                <h1 className="font-title text-3xl md:text-5xl font-black mb-4">
                  <span className="gradient-text">MangaStore</span>
                  <br />
                  <span className="text-manga-text">Xứ Sở Anime</span>
                </h1>
                <p className="text-manga-muted mb-6 leading-relaxed">
                  Hàng nghìn đầu truyện manga, manhwa, manhua chất lượng cao. 
                  Đăng nhập để nhận ưu đãi độc quyền dành cho thành viên! 🌸
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link to="/register" className="btn-primary" id="hero-register-btn">
                    <Sparkles size={16} /> Tham Gia Miễn Phí
                  </Link>
                  <Link to="/search" className="btn-outline" id="hero-browse-btn">
                    <BookOpen size={16} /> Xem Truyện
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-14">
          <SectionTitle emoji="📂" title="Danh Mục" linkTo="/search" />
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/search?category=${cat._id}`}
                className="flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-semibold text-manga-muted hover:text-manga-purple hover:border-purple-500 transition-all hover:glow-purple"
                id={`category-chip-${cat.slug}`}
              >
                <Tag size={14} />
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured / Khuyến mãi */}
      <section className="mb-14">
        <SectionTitle emoji="🔥" title="Khuyến Mãi Nổi Bật" color="var(--accent-pink)" linkTo="/search?isFeatured=true" />
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
          <p className="text-manga-muted text-center py-8">Chưa có truyện nổi bật</p>
        )}
      </section>

      {/* New Comics */}
      <section className="mb-14">
        <SectionTitle emoji="✨" title="Mới Nhất" color="var(--accent-cyan)" linkTo="/search?sort=newest" />
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
          <p className="text-manga-muted text-center py-8">Chưa có truyện mới</p>
        )}
      </section>

      {/* Promo Banner */}
      <section className="mb-14">
        <div className="glass rounded-2xl p-8 text-center border border-pink-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-cyan-900/20 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="font-title text-2xl font-black gradient-text mb-2">Ưu Đãi Thành Viên Mới</h2>
            <p className="text-manga-muted mb-4 max-w-md mx-auto">
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

      {/* Bestseller */}
      <section className="mb-14">
        <SectionTitle emoji="🏆" title="Bán Chạy Nhất" color="var(--accent-yellow)" linkTo="/search?sort=bestseller" />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : bestseller.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bestseller.slice(0, 5).map((comic, idx) => (
              <div key={comic._id} className="relative">
                {idx < 3 && (
                  <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-black text-white shadow-lg">
                    {idx + 1}
                  </div>
                )}
                <ComicCard comic={comic} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-manga-muted text-center py-8">Chưa có dữ liệu bán chạy</p>
        )}
      </section>
    </div>
  )
}

export default HomePage
