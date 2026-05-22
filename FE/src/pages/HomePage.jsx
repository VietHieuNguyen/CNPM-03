import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { comicsAPI, categoriesAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import ComicCard from '../components/ComicCard'
import { IconGift } from '../components/Icons'
import toast from 'react-hot-toast'
import heroImg from '../assets/image.png'

const SectionTitle = ({ title, linkTo, themeColor = 'red' }) => {
  // Determine matching style for "Xem tất cả" button based on themeColor
  const outlineStyles = {
    red: 'border-[#b5503a] text-[#b5503a] hover:bg-[#b5503a] hover:text-white',
    green: 'border-[#5a7247] text-[#5a7247] hover:bg-[#5a7247] hover:text-white',
    gold: 'border-[#b89b5e] text-[#b89b5e] hover:bg-[#b89b5e] hover:text-white'
  }

  const borderLeftGradients = {
    red: 'before:bg-gradient-to-b before:from-[#b5503a] before:to-[#d4826e]',
    green: 'before:bg-gradient-to-b before:from-[#5a7247] before:to-[#7d9b68]',
    gold: 'before:bg-gradient-to-b before:from-[#b89b5e] before:to-[#c4a882]'
  }

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
      <h2 className={`section-title flex items-center gap-2 ${borderLeftGradients[themeColor] || borderLeftGradients.red}`}>
        {title}
      </h2>
      {linkTo && (
        <Link
          to={linkTo}
          className={`border-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${
            outlineStyles[themeColor] || outlineStyles.red
          }`}
        >
          Xem tất cả <span className="font-serif">→</span>
        </Link>
      )}
    </div>
  )
}

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
      } catch {
        toast.error('Không thể tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="w-full bg-[#FEFEFE]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
        {/* ===== HERO ===== */}
        <section className="mb-24 sm:mb-32 animate-fade-up">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#faf8f5] via-[#f7f2ea] to-[#fcfaf7] p-8 md:p-20 border border-[#d9cbb8] flex flex-col md:flex-row items-center justify-between gap-16 min-h-[460px] shadow-warm">
            {/* Left Side Content */}
            <div className="relative z-10 max-w-2xl flex-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5a7247] to-[#7d9b68] flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-warm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[#9a8672] text-xs sm:text-sm">Chào mừng trở lại</p>
                      <p className="text-[#3d2b1a] font-bold text-base sm:text-lg">{user.name}</p>
                    </div>
                  </div>
                  <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#3d2b1a] leading-tight">
                    Khám phá<br />
                    <span className="text-[#b5503a]">thế giới truyện tranh</span>
                  </h1>
                  <p className="text-[#6b5744] mb-8 leading-relaxed text-sm sm:text-lg max-w-lg">
                    Hàng nghìn đầu truyện manga, manhwa, manhua chất lượng cao. 
                    Cập nhật liên tục, giao hàng nhanh toàn quốc!
                  </p>
                  <div className="flex gap-6 sm:gap-8 flex-wrap">
                    <Link to="/search" className="bg-[#b5503a] text-white text-sm sm:text-base font-bold px-10 py-4 rounded-[10px] border border-[#b5503a] hover:bg-[#a0402b] hover:border-[#a0402b] transition-all duration-300 cursor-pointer shadow-warm-hover" id="hero-explore-btn">
                      Khám Phá Ngay
                    </Link>
                    <Link to="/search?sort=bestseller" className="border-2 border-[#b5503a] text-[#b5503a] text-sm sm:text-base font-bold px-10 py-4 rounded-[10px] hover:bg-[#b5503a] hover:text-white transition-all duration-300 cursor-pointer" id="hero-bestseller-btn">
                      Bán Chạy
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 bg-[#FEFEFE] text-[#b5503a] text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
                    <span className="text-xs">★</span> THIÊN ĐƯỜNG TRUYỆN TRANH
                  </div>
                  <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#3d2b1a] leading-tight">
                    <span className="text-[#b5503a]">MangaStore</span><br />
                    Xứ Sở Manga
                  </h1>
                  <p className="text-[#6b5744] mb-8 leading-relaxed text-sm sm:text-lg max-w-lg">
                    Hàng nghìn đầu truyện manga, manhwa, manhua chất lượng cao.<br />
                    Đăng nhập để nhận ưu đãi độc quyền dành cho thành viên!
                  </p>
                  <div className="flex gap-6 sm:gap-8 flex-wrap">
                    <Link to="/register" className="bg-[#b5503a] text-white text-sm sm:text-base font-bold px-10 py-4 rounded-[10px] border border-[#b5503a] hover:bg-[#a0402b] hover:border-[#a0402b] transition-all duration-300 cursor-pointer shadow-warm-hover" id="hero-register-btn">
                      Tham Gia Miễn Phí
                    </Link>
                    <Link to="/search" className="border-2 border-[#5a7247] text-[#5a7247] text-sm sm:text-base font-bold px-10 py-4 rounded-[10px] hover:bg-[#5a7247] hover:text-white transition-all duration-300 cursor-pointer" id="hero-browse-btn">
                      Xem Truyện
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Right Side Illustration */}
            <div className="relative w-full md:w-1/2 flex justify-center md:justify-end items-center">
              <img 
                src={heroImg} 
                alt="MangaStore Banner Artwork" 
                className="max-h-[320px] sm:max-h-[400px] md:max-h-[460px] w-auto object-contain animate-float drop-shadow-lg select-none" 
              />
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        {categories.length > 0 && (
          <section className="mb-24 sm:mb-32">
            <SectionTitle title="Danh Mục" linkTo="/search" themeColor="green" />
            <div className="flex gap-3 sm:gap-4 flex-wrap">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/search?category=${cat._id}`} className="flex items-center gap-2 bg-white border border-[#d9cbb8] px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold text-[#6b5744] hover:text-[#b5503a] hover:border-[#b5503a]/30 hover:shadow-warm transition-all" id={`category-chip-${cat.slug}`}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== FEATURED ===== */}
        <section className="mb-24 sm:mb-32">
          <SectionTitle title="Khuyến Mãi Nổi Bật" linkTo="/search?isFeatured=true" themeColor="red" />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {featured.slice(0, 6).map((comic) => <ComicCard key={comic._id} comic={comic} />)}
            </div>
          ) : (
            <p className="text-[#9a8672] text-center py-8 font-serif italic" id="featured-empty-placeholder">Chưa có truyện nổi bật</p>
          )}
        </section>

        {/* ===== NEW ===== */}
        <section className="mb-24 sm:mb-32">
          <SectionTitle title="Mới Nhất" linkTo="/search?sort=newest" themeColor="green" />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : newComics.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {newComics.slice(0, 6).map((comic) => <ComicCard key={comic._id} comic={comic} />)}
            </div>
          ) : (
            <p className="text-[#9a8672] text-center py-8 font-serif italic" id="new-empty-placeholder">Chưa có truyện mới</p>
          )}
        </section>

        {/* ===== PROMO BANNER ===== */}
        <section className="mb-24 sm:mb-32">
          <div className="bg-[#fdfbf7] rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-[#b5503a] relative overflow-hidden flex flex-col items-center shadow-warm">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#b5503a] flex items-center justify-center shadow-warm mb-4">
                <IconGift className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3d2b1a] mb-3">Ưu Đãi Thành Viên Mới</h2>
              <p className="text-[#6b5744] mb-6 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
                Đăng ký hôm nay và nhận ngay voucher <span className="font-bold text-[#b5503a]">giảm 20%</span> cho đơn hàng đầu tiên!
              </p>
              {!user && (
                <Link to="/register" className="bg-[#b5503a] text-white text-sm sm:text-base font-bold px-10 py-4 rounded-[10px] border border-[#b5503a] hover:bg-[#a0402b] hover:border-[#a0402b] transition-all duration-300 cursor-pointer shadow-warm-hover" id="promo-register-btn">
                  Nhận Ưu Đãi Ngay
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ===== BESTSELLER ===== */}
        <section className="mb-24 sm:mb-32">
          <SectionTitle title="Bán Chạy Nhất" linkTo="/search?sort=bestseller" themeColor="gold" />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : bestseller.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {bestseller.slice(0, 6).map((comic, idx) => (
                <div key={comic._id} className="relative">
                  {idx < 3 && (
                    <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-gradient-to-br from-[#b89b5e] to-[#c4a882] flex items-center justify-center text-xs font-black text-white shadow-warm">
                      {idx + 1}
                    </div>
                  )}
                  <ComicCard comic={comic} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#9a8672] text-center py-8 font-serif italic" id="bestseller-empty-placeholder">Chưa có dữ liệu bán chạy</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage
