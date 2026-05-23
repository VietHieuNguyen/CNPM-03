import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { comicsAPI, categoriesAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import ComicCard from "../components/ComicCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import { IconGift } from "../components/Icons";
import toast from "react-hot-toast";
import heroImg from "../assets/image.png";

const SectionTitle = ({ title, linkTo, themeColor = "red" }) => {
  // Determine matching style for "Xem tất cả" button based on themeColor
  const outlineStyles = {
    red: "text-[#b5503a] hover:text-[#a0402b]",
    green: "text-[#5a7247] hover:text-[#465a36]",
    gold: "text-[#b89b5e] hover:text-[#a3874e]",
  };

  const borderLeftGradients = {
    red: "before:bg-gradient-to-b before:from-[#b5503a] before:to-[#d4826e]",
    green: "before:bg-gradient-to-b before:from-[#5a7247] before:to-[#7d9b68]",
    gold: "before:bg-gradient-to-b before:from-[#b89b5e] before:to-[#c4a882]",
  };

  return (
    <div className="flex items-center justify-between mb-7 sm:mb-8 flex-wrap gap-3">
      <h2
        className={`section-title flex items-center gap-2 ${borderLeftGradients[themeColor] || borderLeftGradients.red}`}
      >
        {title}
      </h2>
      {linkTo && (
        <Link
          to={linkTo}
          className={`py-1.5 text-sm font-bold transition-all duration-300 ${
            outlineStyles[themeColor] || outlineStyles.red
          }`}
        >
          Xem tất cả <span className="font-serif">→</span>
        </Link>
      )}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="comic-card">
    <div className="shimmer-loading w-full aspect-[2/3]" />
    <div className="p-4 space-y-3">
      <div className="shimmer-loading h-3 w-3/4 rounded" />
      <div className="shimmer-loading h-4 w-full rounded" />
      <div className="shimmer-loading h-3 w-1/2 rounded" />
    </div>
  </div>
);

const HomePage = () => {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [newComics, setNewComics] = useState([]);
  const [bestseller, setBestseller] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featRes, newRes, bestRes, mostRes, catRes] = await Promise.all([
          comicsAPI.featured(),
          comicsAPI.newComics(),
          comicsAPI.bestseller(),
          comicsAPI.mostViewed(),
          categoriesAPI.list(),
        ]);
        setFeatured(featRes.data.data.comics);
        setNewComics(newRes.data.data.comics);
        setBestseller(bestRes.data.data.comics);
        setMostViewed(mostRes.data.data.comics);
        setCategories(catRes.data.data.categories);
      } catch {
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="w-full bg-[#FEFEFE]">
      <div className="w-full px-0 py-0">
        {/* ===== HERO ===== */}
        <section className="w-full bg-[#FEFEFE] mb-16 sm:mb-20 xl:mb-24 animate-fade-up">
<div
  className="
relative
overflow-hidden
w-full
bg-[#FEFEFE]
min-h-[760px]
px-6
sm:px-10
lg:px-20
xl:px-28
2xl:px-36
py-16
lg:py-24
flex
flex-col
lg:flex-row
items-center
justify-between
gap-16
"
>
            {/* Left Side Content */}
            <div
  className="
relative
z-10
w-full
lg:w-[46%]
space-y-8
"
>
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5a7247] to-[#7d9b68] flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-warm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[#9a8672] text-xs sm:text-sm">
                        Chào mừng trở lại
                      </p>
                      <p className="text-[#3d2b1a] font-bold text-base sm:text-lg">
                        {user.name}
                      </p>
                    </div>
                  </div>
                  <h1
                    className="
font-serif
text-4xl
sm:text-5xl
lg:text-7xl
font-black
tracking-tight
mb-6
text-[#3d2b1a]
leading-[1.05]
"
                  >
                    Khám phá
                    <br />
                    <span className="text-[#b5503a]">
                      thế giới truyện tranh
                    </span>
                  </h1>
                  <p
                    className="
text-[#6b5744]
mb-10
leading-9
text-[15px]
sm:text-xl
max-w-2xl
"
                  >
                    Hàng nghìn đầu truyện manga, manhwa, manhua chất lượng cao.
                    Cập nhật liên tục, giao hàng nhanh toàn quốc!
                  </p>
                  <div className="flex flex-wrap items-center gap-6 pt-6">
                    <Link
                      to="/search"
                      className="
inline-flex
items-center
justify-center
min-h-[64px]
px-10
sm:px-14
rounded-[20px]
bg-[#b5503a]
text-white
text-lg
font-bold
tracking-tight
border
border-[#b5503a]
shadow-[0_14px_35px_rgba(181,80,58,0.22)]
transition-all
duration-300
hover:bg-[#a34531]
hover:-translate-y-1
hover:shadow-[0_18px_40px_rgba(181,80,58,0.28)]
"
                      id="hero-explore-btn"
                    >
                      Khám Phá Ngay
                    </Link>
                    <Link
                      to="/search?sort=bestseller"
                      className="border-2 border-[#b5503a] text-[#b5503a] text-sm sm:text-base font-bold px-10 py-4 rounded-[10px] hover:bg-[#b5503a] hover:text-white transition-all duration-300 cursor-pointer"
                      id="hero-bestseller-btn"
                    >
                      Bán Chạy
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 bg-[#FEFEFE] text-[#b5503a] text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-sm">
                    <span className="text-xs">★</span> THIÊN ĐƯỜNG TRUYỆN TRANH
                  </div>
                  <h1
                    className="
font-serif
text-4xl
sm:text-5xl
lg:text-7xl
font-black
tracking-tight
mb-6
text-[#3d2b1a]
leading-[1.05]
"
                  >
                    <span className="text-[#b5503a]">MangaStore</span>
                    <br />
                    Xứ Sở Manga
                  </h1>
                  <p
                    className="
text-[#6b5744]
mb-10
leading-9
text-[15px]
sm:text-xl
max-w-2xl
"
                  >
                    Hàng nghìn đầu truyện manga, manhwa, manhua chất lượng cao.
                    <br />
                    Đăng nhập để nhận ưu đãi độc quyền dành cho thành viên!
                  </p>
                  <div className="flex flex-wrap items-center gap-6 pt-6">
                    <Link
                      to="/register"
                      className="
inline-flex
items-center
justify-center
min-h-[64px]
px-10
sm:px-14
rounded-[20px]
bg-[#b5503a]
text-white
text-lg
font-bold
tracking-tight
border
border-[#b5503a]
shadow-[0_14px_35px_rgba(181,80,58,0.22)]
transition-all
duration-300
hover:bg-[#a34531]
hover:-translate-y-1
hover:shadow-[0_18px_40px_rgba(181,80,58,0.28)]
"
                      id="hero-register-btn"
                    >
                      Tham Gia Miễn Phí
                    </Link>
                    <Link
                      to="/search"
                      className="
inline-flex
items-center
justify-center
min-h-[64px]
px-10
sm:px-14
rounded-[20px]
border-2
border-[#5a7247]
bg-white/70
text-[#5a7247]
text-lg
font-bold
tracking-tight
transition-all
duration-300
hover:bg-[#5a7247]
hover:text-white
hover:-translate-y-1
"
                      id="hero-browse-btn"
                    >
                      Xem Truyện
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Right Side Illustration */}
            <div
  className="
relative
w-full
lg:w-[54%]
flex
justify-center
lg:justify-end
items-center
"
>
              <img
                src={heroImg}
                alt="MangaStore Banner Artwork"
                className="
w-full
max-w-[980px]
object-contain
animate-float
select-none
"
              />
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        {categories.length > 0 && (
          <section className="mb-16 sm:mb-20 xl:mb-24">
            <SectionTitle
              title="Danh Mục"
              linkTo="/search"
              themeColor="green"
            />
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/search?category=${cat._id}`}
                  className="flex items-center gap-2 bg-white border border-[#d9cbb8] px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold text-[#6b5744] hover:text-[#b5503a] hover:border-[#b5503a]/30 hover:shadow-warm transition-all"
                  id={`category-chip-${cat.slug}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== FEATURED ===== */}
        <section className="mb-16 sm:mb-20 xl:mb-24">
          <SectionTitle
            title="Khuyến Mãi Nổi Bật"
            linkTo="/search?isFeatured=true"
            themeColor="red"
          />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 xl:gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 xl:gap-6">
              {featured.slice(0, 6).map((comic) => (
                <ComicCard key={comic._id} comic={comic} />
              ))}
            </div>
          ) : (
            <p
              className="text-[#9a8672] text-center py-8 font-serif italic"
              id="featured-empty-placeholder"
            >
              Chưa có truyện nổi bật
            </p>
          )}
        </section>

        {/* ===== NEW ===== */}
        <section className="mb-16 sm:mb-20 xl:mb-24">
          <SectionTitle
            title="Mới Nhất"
            linkTo="/search?sort=newest"
            themeColor="green"
          />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 xl:gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
            </div>
          ) : newComics.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 xl:gap-6">
              {newComics.slice(0, 6).map((comic) => (
                <ComicCard key={comic._id} comic={comic} />
              ))}
            </div>
          ) : (
            <p
              className="text-[#9a8672] text-center py-8 font-serif italic"
              id="new-empty-placeholder"
            >
              Chưa có truyện mới
            </p>
          )}
        </section>

        {/* ===== PROMO BANNER ===== */}
        <section className="mb-16 sm:mb-20 xl:mb-24">
          <div
            className="
bg-[#fdfbf7]
rounded-[32px]
px-6
py-10
sm:px-10
sm:py-14
text-center
border
border-[#eadfd2]
relative
overflow-hidden
flex
flex-col
items-center
shadow-[0_10px_35px_rgba(61,43,26,0.05)]
"
          >
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#b5503a] flex items-center justify-center shadow-warm mb-4">
                <IconGift className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3d2b1a] mb-3">
                Ưu Đãi Thành Viên Mới
              </h2>
              <p className="text-[#6b5744] mb-4 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
                Đăng ký hôm nay và nhận ngay voucher{" "}
                <span className="font-bold text-[#b5503a]">giảm 20%</span> cho
                đơn hàng đầu tiên!
              </p>
              {!user && (
                <Link
                  to="/register"
                  className="
inline-flex
items-center
justify-center
min-h-[64px]
px-10
sm:px-14
rounded-[20px]
bg-[#b5503a]
text-white
text-lg
font-bold
tracking-tight
border
border-[#b5503a]
shadow-[0_14px_35px_rgba(181,80,58,0.22)]
transition-all
duration-300
hover:bg-[#a34531]
hover:-translate-y-1
hover:shadow-[0_18px_40px_rgba(181,80,58,0.28)]
"
                  id="promo-register-btn"
                >
                  Nhận Ưu Đãi Ngay
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ===== BESTSELLER ===== */}
        <section className="mb-16 sm:mb-20 xl:mb-24">
          <SectionTitle
            title="Bán Chạy Nhất"
            linkTo="/search?sort=bestseller"
            themeColor="gold"
          />
          {loading ? (
            <div className="flex gap-6 overflow-hidden py-1">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="w-[190px] sm:w-[220px] lg:w-[240px] xl:w-[255px] flex-shrink-0"
                  >
                    <SkeletonCard />
                  </div>
                ))}
            </div>
          ) : bestseller.length > 0 ? (
            <HorizontalCarousel comics={bestseller} showRanking={true} />
          ) : (
            <p
              className="text-[#9a8672] text-center py-8 font-serif italic"
              id="bestseller-empty-placeholder"
            >
              Chưa có dữ liệu bán chạy
            </p>
          )}
        </section>

        {/* ===== MOST VIEWED ===== */}
        <section className="mb-16 sm:mb-20 xl:mb-24">
          <SectionTitle
            title="Xem Nhiều Nhất"
            linkTo="/search?sort=rating"
            themeColor="red"
          />
          {loading ? (
            <div className="flex gap-6 overflow-hidden py-1">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="w-[190px] sm:w-[220px] lg:w-[240px] xl:w-[255px] flex-shrink-0"
                  >
                    <SkeletonCard />
                  </div>
                ))}
            </div>
          ) : mostViewed.length > 0 ? (
            <HorizontalCarousel comics={mostViewed} showRanking={false} />
          ) : (
            <p
              className="text-[#9a8672] text-center py-8 font-serif italic"
              id="mostviewed-empty-placeholder"
            >
              Chưa có dữ liệu lượt xem
            </p>
          )}
        </section>
      </div>
      </div>
    </div>
  );
};

export default HomePage;
