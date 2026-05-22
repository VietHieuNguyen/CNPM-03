import { Link } from 'react-router-dom'

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const ComicCard = ({ comic }) => {
  if (!comic) return null

  const finalPrice = comic.price * (1 - (comic.discount || 0) / 100)
  const coverImg = comic.images?.[0] || 'https://placehold.co/300x420/e8ddd1/3d2b1a?text=No+Image'
  const isOutOfStock = comic.stock === 0

  return (
    <Link to={`/comics/${comic.slug}`} className="block group" id={`comic-card-${comic._id}`}>
      <div className="comic-card h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={coverImg}
            alt={comic.title}
            className="card-img"
            loading="lazy"
            onError={(e) => { e.target.src = 'https://placehold.co/300x420/e8ddd1/3d2b1a?text=No+Image' }}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {comic.isNew && <span className="badge badge-new">Mới</span>}
            {comic.isBestSeller && <span className="badge badge-hot">Hot</span>}
            {comic.discount > 0 && <span className="badge badge-sale">-{comic.discount}%</span>}
            {isOutOfStock && <span className="badge badge-out">Hết hàng</span>}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d2b1a]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              Xem chi tiết →
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex-1 flex flex-col gap-1.5">
          <p className="text-wabi-muted text-xs truncate">{comic.author}</p>
          <h3 className="text-wabi-text font-bold text-sm line-clamp-2 leading-snug group-hover:text-wabi-red transition-colors">
            {comic.title}
          </h3>

          {comic.category && (
            <span className="text-xs text-wabi-green font-medium">{comic.category.name}</span>
          )}

          {comic.rating?.avg > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-[11px] h-[11px] text-wabi-gold fill-wabi-gold inline-block" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-xs text-wabi-muted">{comic.rating.avg.toFixed(1)}</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto pt-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-wabi-red text-sm">
                {formatPrice(finalPrice)}
              </span>
              {comic.discount > 0 && (
                <span className="text-wabi-muted text-xs line-through">
                  {formatPrice(comic.price)}
                </span>
              )}
            </div>
            {comic.sold > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <svg className="w-[10px] h-[10px] text-wabi-muted inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span className="text-wabi-muted text-xs">Đã bán: {comic.sold.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ComicCard
