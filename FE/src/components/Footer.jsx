import { Link } from 'react-router-dom'
import { IconBook, IconHeart } from './Icons'

const Footer = () => {
  return (
    <footer className="mt-44 sm:mt-52 xl:mt-60 border-t border-wabi-border/60">
      <div className="bg-[#faf7f2]">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-[160px] sm:py-[180px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16 md:gap-24">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-wabi-red to-wabi-brown flex items-center justify-center">
                  <IconBook className="w-4 h-4 text-white" />
                </div>
                <span className="font-serif text-xl font-bold text-wabi-text tracking-tight">
                  Manga<span className="text-wabi-red">Store</span>
                </span>
              </div>
              <p className="text-wabi-muted text-sm leading-relaxed">
                Thiên đường truyện tranh dành cho các otaku Việt Nam. 
                Hàng nghìn đầu truyện chất lượng, giao hàng nhanh chóng.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-wabi-text font-bold mb-4 text-sm uppercase tracking-wider">Khám Phá</h3>
              <ul className="space-y-2.5">
                {[
                  { to: '/search?sort=newest', label: 'Truyện Mới Nhất' },
                  { to: '/search?sort=bestseller', label: 'Bán Chạy Nhất' },
                  { to: '/search?isFeatured=true', label: 'Khuyến Mãi' },
                  { to: '/search', label: 'Tìm Kiếm' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-wabi-muted text-sm hover:text-wabi-red transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-wabi-text font-bold mb-4 text-sm uppercase tracking-wider">Thể Loại</h3>
              <div className="flex flex-wrap gap-2">
                {['Action', 'Romance', 'Fantasy', 'Isekai', 'Horror', 'Comedy', 'Sports', 'Slice of Life'].map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?tags=${tag}`}
                    className="badge badge-new text-xs hover:bg-wabi-green/20 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-24 pt-10 border-t border-wabi-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-wabi-muted text-sm flex items-center gap-1.5">
              Làm với <IconHeart className="w-3.5 h-3.5 text-wabi-red inline-block animate-soft-pulse" /> cho người yêu truyện tranh
            </p>
            <p className="text-wabi-muted text-sm">&copy; 2025 MangaStore. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
