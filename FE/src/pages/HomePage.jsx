import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { comicsAPI, categoriesAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import ComicCard from "../components/ComicCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import toast from "react-hot-toast";
import heroImg from "../assets/image.png";

const formatPrice = (price) => {
  const formatted = new Intl.NumberFormat('vi-VN').format(price);
  return `${formatted}đ`;
};

const SectionTitle = ({ label, title, linkTo }) => {
  return (
    <div className="flex flex-col space-y-2 mb-8 border-b border-wabi-border/40 pb-5 relative">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9a8672]">
          {label}
        </span>
      )}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#683520]">
          {title}
        </h2>
        {linkTo && (
          <Link
            to={linkTo}
            className="text-xs font-bold uppercase tracking-wider text-[#683520] hover:text-[#522918] transition-colors"
          >
            Xem tất cả truyện ➔
          </Link>
        )}
      </div>
      <div className="absolute bottom-[-1.5px] left-0 w-20 h-[3px] bg-[#683520]" />
    </div>
  );
};

const SkeletonCard = () => (
  <div className="flex flex-col space-y-3">
    <div className="shimmer-loading w-full aspect-[3/4] rounded-2xl" />
    <div className="space-y-2">
      <div className="shimmer-loading h-3 w-1/3 rounded" />
      <div className="shimmer-loading h-4 w-3/4 rounded" />
      <div className="shimmer-loading h-3.5 w-1/2 rounded" />
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
        toast.error("Không thể tải dữ liệu trang chủ");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="w-full bg-[#FEFEFE]">
      {/* ===== HERO ===== */}
      <section className="w-full bg-[#fcfaf7] border-b border-[#eadfd2]/60 animate-fade-up">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-20 xl:px-28 py-20 lg:py-28 flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Content */}
          <div className="relative z-10 w-full lg:w-[48%] space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9a8672] block">
              KHO TÀNG TRUYỆN TRANH TINH TUYỂN
            </span>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6.5xl font-black tracking-tight text-[#3d2b1a] leading-[1.1] space-y-2">
              <div>Gói ghém bình yên</div>
              <div className="text-[#683520] italic font-normal">trong từng trang sách.</div>
            </h1>
            
            <p className="text-[#6b5744] leading-relaxed text-sm sm:text-base max-w-xl">
              Komorebi Manga mang đến những tác phẩm mang đậm hơi thở cuộc sống, giúp bạn tìm thấy niềm vui từ những điều giản đơn nhất.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-6">
              <Link
                to="/search"
                className="inline-flex items-center justify-center min-h-[50px] px-8 bg-[#683520] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#522918] transition-all rounded-none"
              >
                Mua sắm ngay
              </Link>
              <Link
                to="/search?sort=newest"
                className="inline-flex items-center justify-center min-h-[50px] px-8 border border-[#eadfd2] text-[#6b5744] text-xs font-bold uppercase tracking-widest hover:bg-white transition-all rounded-none"
              >
                Xem bộ sưu tập
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full lg:w-[48%] flex justify-center lg:justify-end items-center">
            <img
              src={heroImg}
              alt="Komorebi Manga Book Showcase"
              className="w-full max-w-[580px] object-contain animate-float select-none"
            />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-[100px] space-y-[120px]">
        {/* ===== CATEGORIES ===== */}
        {categories.length > 0 && (
          <section className="space-y-6">
            <SectionTitle label="DANH MỤC" title="Khám phá Thể loại" />
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/search?category=${cat._id}`}
                  className="bg-[#faf8f5] border border-[#d9cbb8] px-5 py-2.5 rounded-full text-xs font-bold text-[#6b5744] hover:text-white hover:bg-[#683520] hover:border-[#683520] transition-all shadow-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== FEATURED (Sản phẩm nổi bật) ===== */}
        <section className="space-y-8">
          <SectionTitle label="CỬA HÀNG" title="Sản phẩm nổi bật" linkTo="/search?isFeatured=true" />

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {featured.slice(0, 4).map((comic) => (
                <ComicCard key={comic._id} comic={comic} />
              ))}
            </div>
          ) : (
            <p className="text-[#9a8672] text-center py-8 font-serif italic">Không có tác phẩm nổi bật nào</p>
          )}
        </section>

        {/* ===== NEWSLETTER (Gửi gắm tâm tình) ===== */}
        <section>
          <div className="bg-[#f6f1eb] rounded-[28px] p-8 sm:p-12 shadow-sm border border-[#eadfd2]/40 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#683520]">
                Gửi gắm tâm tình
              </h2>
              <p className="text-[#6b5744] text-xs sm:text-sm leading-relaxed">
                Đăng ký để nhận những bản tin về nghệ thuật và ưu đãi sớm nhất từ Komorebi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Địa chỉ email của bạn"
                className="bg-white border border-[#eadfd2] text-[#3d2b1a] placeholder-wabi-muted text-xs px-5 py-3.5 focus:outline-none focus:border-[#683520] min-w-[280px] rounded-none"
              />
              <button
                onClick={() => toast.success("Cảm ơn bạn đã đăng ký nhận bản tin! 🌸")}
                className="bg-[#683520] text-white hover:bg-[#522918] transition-all font-bold text-xs uppercase tracking-wider px-8 py-3.5 flex items-center justify-center cursor-pointer rounded-none"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </section>

        {/* ===== WABI-SABI PHILOSOPHY ===== */}
        <section className="py-6 border-l-2 border-[#683520] pl-6 sm:pl-10">
          <div className="space-y-4">
            <h3 className="font-serif text-xl sm:text-2xl font-black text-[#683520]">
              Triết lý Wabi-sabi
            </h3>
            <blockquote className="font-serif italic text-sm sm:text-base text-[#6b5744] leading-relaxed max-w-4xl">
              "Trong nghệ thuật truyện tranh của Komorebi, chúng tôi trân trọng những nét vẽ tay mộc mạc và sự phai màu của giấy theo năm tháng. Mỗi cuốn sách không chỉ là một sản phẩm, mà là một hành trình tìm về sự tĩnh lặng."
            </blockquote>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a8672] mt-3 block">
              — KOMOREBI FOUNDERS
            </span>
          </div>
        </section>

        {/* ===== 10 BESTSELLERS HORIZONTAL ===== */}
        <section className="space-y-8">
          <SectionTitle label="XU HƯỚNG" title="10 Sản phẩm bán chạy nhất" linkTo="/search?sort=bestseller" />
          {loading ? (
            <div className="flex gap-6 overflow-hidden py-1">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="w-[200px] flex-shrink-0">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : bestseller.length > 0 ? (
            <HorizontalCarousel comics={bestseller} showRanking={true} />
          ) : (
            <p className="text-[#9a8672] text-center py-8 font-serif italic">Không có sản phẩm bán chạy</p>
          )}
        </section>

        {/* ===== MOST VIEWED HORIZONTAL ===== */}
        <section className="space-y-8">
          <SectionTitle label="PHỔ BIẾN" title="Sản phẩm xem nhiều nhất" linkTo="/search?sort=rating" />
          {loading ? (
            <div className="flex gap-6 overflow-hidden py-1">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="w-[200px] flex-shrink-0">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : mostViewed.length > 0 ? (
            <HorizontalCarousel comics={mostViewed} showRanking={false} />
          ) : (
            <p className="text-[#9a8672] text-center py-8 font-serif italic">Không có sản phẩm xem nhiều</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
