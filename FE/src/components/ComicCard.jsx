import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const formatPrice = (price) => {
  const formatted = new Intl.NumberFormat('vi-VN').format(price)
  return `${formatted}đ`
}

const ComicCard = ({ comic }) => {
  if (!comic) return null

  const finalPrice = comic.price * (1 - (comic.discount || 0) / 100)
  const coverImg = comic.images?.[0] || 'https://placehold.co/300x420/e8ddd1/3d2b1a?text=No+Image'
  
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setLiked(list.includes(comic._id))
  }, [comic._id])

  const toggleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]')
    let newList
    if (liked) {
      newList = list.filter(id => id !== comic._id)
    } else {
      newList = [...list, comic._id]
    }
    localStorage.setItem('wishlist', JSON.stringify(newList))
    setLiked(!liked)
  }

  return (
    <Link
      to={`/comics/${comic.slug}`}
      className="group block w-full"
      id={`comic-card-${comic._id}`}
    >
      <div className="flex flex-col space-y-3">
        {/* IMAGE CONTAINER */}
        <div className="relative overflow-hidden aspect-[3/4] rounded-2xl border border-wabi-border/30 bg-[#f8f5f1]">
          <img
            src={coverImg}
            alt={comic.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://placehold.co/300x420/e8ddd1/3d2b1a?text=No+Image'
            }}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
          />

          {/* BADGES */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {comic.isBestSeller && (
              <span className="bg-[#683520] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                BÁN CHẠY
              </span>
            )}
            {comic.isNew && (
              <span className="bg-[#5a7247] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                MỚI
              </span>
            )}
            {comic.discount > 0 && (
              <span className="bg-[#b5503a] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                -{comic.discount}%
              </span>
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div className="flex flex-col space-y-1">
          {comic.category && (
            <span className="text-[9px] font-bold text-wabi-muted uppercase tracking-wider block">
              {comic.category.name}
            </span>
          )}
          <h4 className="font-serif text-sm font-black text-[#3d2b1a] group-hover:text-[#683520] transition-colors line-clamp-1 leading-snug">
            {comic.title}
          </h4>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-xs text-[#683520]">
              {formatPrice(finalPrice)}
            </span>
            <button
              onClick={toggleLike}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <svg
                className={`w-4 h-4 transition-all duration-300 ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 hover:scale-110'}`}
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ComicCard