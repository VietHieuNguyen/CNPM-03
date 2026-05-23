import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import QuantityControl from '../components/QuantityControl'
import { IconCart, IconTrash } from '../components/Icons'

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const CartPage = () => {
  const { cart, loading, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()

  if (loading && !cart) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-20 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-wabi-red/20 border-t-wabi-red rounded-full animate-spin" />
      </div>
    )
  }

  const items = cart?.items || []

  if (items.length === 0) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f8f5f1] flex items-center justify-center mx-auto mb-6">
          <IconCart className="w-9 h-9 text-[#8f7b68]" />
        </div>
        <h2 className="text-2xl font-black text-wabi-text font-serif mb-3">Giỏ hàng của bạn đang trống</h2>
        <p className="text-wabi-muted text-[15px] mb-8 max-w-md mx-auto">
          Hãy khám phá kho truyện khổng lồ của MangaStore và tìm kiếm những bộ truyện yêu thích của bạn nhé!
        </p>
        <Link to="/search" className="btn-primary inline-flex px-8 py-3.5 rounded-2xl">
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-12 pb-24">
      {/* Title */}
      <div className="mb-10 sm:mb-12 border-b border-wabi-border/60 pb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#3d2b1a] font-serif">Giỏ Hàng</h1>
          <p className="text-sm text-wabi-muted mt-2">Bạn đang có {totalItems} sản phẩm trong giỏ hàng</p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm font-semibold text-wabi-red hover:underline cursor-pointer"
        >
          Xoá toàn bộ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 xl:gap-14 items-start">
        {/* Cart Items List */}
        <div className="space-y-5">
          {items.map((item) => {
            const comic = item.comic
            if (!comic) return null
            const finalPrice = comic.price * (1 - (comic.discount || 0) / 100)

            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-5 rounded-[28px] bg-white border border-wabi-border/60 shadow-[0_4px_20px_rgba(61,43,26,0.02)] transition-all duration-300 hover:shadow-md"
              >
                {/* Image & Title */}
                <div className="flex gap-4 items-center">
                  <img
                    src={comic.images?.[0] || 'https://placehold.co/100x140'}
                    alt={comic.title}
                    className="w-20 h-28 object-cover rounded-xl border border-wabi-border/40 bg-[#f8f5f1]"
                  />
                  <div className="space-y-1">
                    {comic.category && (
                      <span className="text-[11px] font-bold text-wabi-green uppercase tracking-wider">
                        {comic.category.name}
                      </span>
                    )}
                    <h3 className="font-extrabold text-[16px] text-wabi-text leading-snug hover:text-wabi-red transition-colors line-clamp-2">
                      <Link to={`/comics/${comic.slug}`}>{comic.title}</Link>
                    </h3>
                    <p className="text-xs text-wabi-muted">Tác giả: {comic.author}</p>
                    <div className="flex items-center gap-2 mt-1 sm:hidden">
                      <span className="text-sm font-black text-wabi-red">{formatPrice(finalPrice)}</span>
                      {comic.discount > 0 && (
                        <span className="text-xs text-wabi-muted line-through">{formatPrice(comic.price)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls & Price */}
                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                  {/* Quantity Control */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[11px] text-wabi-muted font-bold uppercase tracking-wider hidden sm:block">Số lượng</span>
                    <QuantityControl
                      value={item.quantity}
                      onChange={(newQty) => updateQuantity(comic._id, newQty)}
                      min={1}
                      max={comic.stock}
                    />
                  </div>

                  {/* Price info for large screens */}
                  <div className="hidden sm:flex flex-col items-end gap-0.5 min-w-[120px]">
                    <span className="text-[11px] text-wabi-muted font-bold uppercase tracking-wider">Đơn giá</span>
                    <span className="text-[15px] font-black text-wabi-red">{formatPrice(finalPrice)}</span>
                    {comic.discount > 0 && (
                      <span className="text-xs text-wabi-muted line-through">{formatPrice(comic.price)}</span>
                    )}
                  </div>

                  {/* Total price for this item */}
                  <div className="flex flex-col items-end gap-0.5 min-w-[120px]">
                    <span className="text-[11px] text-wabi-muted font-bold uppercase tracking-wider hidden sm:block">Tổng cộng</span>
                    <span className="text-lg font-black text-[#3d2b1a]">{formatPrice(finalPrice * item.quantity)}</span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(comic._id)}
                    className="p-2.5 rounded-xl bg-red-50 text-wabi-red hover:bg-red-100 transition-colors cursor-pointer"
                    title="Xoá khỏi giỏ hàng"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="rounded-[28px] bg-gradient-to-br from-[#fffaf5] to-[#f7efe7] border border-[#eadfd2] p-6 shadow-[0_10px_30px_rgba(61,43,26,0.05)] space-y-6">
          <h2 className="text-xl font-bold text-[#3d2b1a] font-serif border-b border-[#eadfd2] pb-4">Tóm tắt đơn hàng</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-wabi-secondary">
              <span>Tạm tính ({totalItems} sản phẩm)</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-wabi-secondary">
              <span>Phí vận chuyển</span>
              <span className="text-wabi-green font-semibold">Miễn phí</span>
            </div>
            <div className="border-t border-[#eadfd2] pt-4 flex justify-between items-baseline">
              <span className="text-base font-bold text-[#3d2b1a]">Thành tiền</span>
              <div className="text-right">
                <span className="text-2xl font-black text-wabi-red">{formatPrice(totalPrice)}</span>
                <p className="text-[10px] text-wabi-muted mt-1">(Đã bao gồm VAT nếu có)</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full h-14 rounded-2xl bg-wabi-red text-white font-bold text-[15px] shadow-lg shadow-red-500/20 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
          >
            Tiến hành thanh toán
          </button>

          <Link
            to="/search"
            className="w-full h-14 rounded-2xl bg-white border border-[#d9cbb8] text-wabi-brown font-bold text-[15px] hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            Tiếp tục mua truyện
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CartPage
