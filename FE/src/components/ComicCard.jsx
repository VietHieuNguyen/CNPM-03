import { Link } from 'react-router-dom'

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)

const ComicCard = ({ comic }) => {
  if (!comic) return null

  const finalPrice =
    comic.price * (1 - (comic.discount || 0) / 100)

  const coverImg =
    comic.images?.[0] ||
    'https://placehold.co/300x420/e8ddd1/3d2b1a?text=No+Image'

  const isOutOfStock = comic.stock === 0

  return (
    <Link
      to={`/comics/${comic.slug}`}
      className="group block"
      id={`comic-card-${comic._id}`}
    >
      <div className="overflow-hidden rounded-3xl border border-wabi-border/60 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10">
        
        {/* IMAGE */}
        <div className="relative overflow-hidden">
          <img
            src={coverImg}
            alt={comic.title}
            loading="lazy"
            onError={(e) => {
              e.target.src =
                'https://placehold.co/300x420/e8ddd1/3d2b1a?text=No+Image'
            }}
            className="h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* BADGES */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {comic.isNew && (
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                MỚI
              </span>
            )}

            {comic.isBestSeller && (
              <span className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                HOT
              </span>
            )}

            {comic.discount > 0 && (
              <span className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                -{comic.discount}%
              </span>
            )}

            {isOutOfStock && (
              <span className="rounded-full bg-gray-800 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                HẾT HÀNG
              </span>
            )}
          </div>

          {/* Hover action */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-center rounded-xl bg-white/90 py-2 text-sm font-semibold text-wabi-brown backdrop-blur-md">
              Xem chi tiết →
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col p-4">
          
          {/* AUTHOR */}
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-wabi-muted">
            {comic.author}
          </p>

          {/* TITLE */}
          <h3 className="line-clamp-2 min-h-[52px] text-[16px] font-extrabold leading-snug text-wabi-text transition-colors duration-300 group-hover:text-wabi-red">
            {comic.title}
          </h3>

          {/* CATEGORY + RATING */}
          <div className="mt-3 flex items-center gap-2">
            {comic.category && (
              <span className="rounded-lg bg-wabi-green/10 px-2.5 py-1 text-[11px] font-bold text-wabi-green">
                {comic.category.name}
              </span>
            )}

            {comic.rating?.avg > 0 && (
              <div className="ml-auto flex items-center gap-1 rounded-lg bg-yellow-100 px-2 py-1">
                <svg
                  className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>

                <span className="text-[11px] font-bold text-yellow-700">
                  {comic.rating.avg.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* PRICE */}
          <div className="mt-5 border-t border-wabi-border/50 pt-4">
            <div className="flex items-end justify-between">
              
              <div className="flex flex-col">
                {comic.discount > 0 && (
                  <span className="text-[12px] text-gray-400 line-through">
                    {formatPrice(comic.price)}
                  </span>
                )}

                <span className="text-[20px] font-black tracking-tight text-wabi-red">
                  {formatPrice(finalPrice)}
                </span>
              </div>

              {comic.sold > 0 && (
                <div className="rounded-xl bg-[#f8f5f1] px-3 py-2 text-[11px] font-semibold text-wabi-brown">
                  Đã bán{' '}
                  {comic.sold >= 1000
                    ? (comic.sold / 1000).toFixed(1) + 'k'
                    : comic.sold}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ComicCard