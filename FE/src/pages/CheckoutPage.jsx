import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { orderAPI } from '../api'
import toast from 'react-hot-toast'

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const CheckoutPage = () => {
  const { cart, totalPrice, totalItems, fetchCart } = useCart()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    note: '',
  })
  
  const [paymentMethod, setPaymentMethod] = useState('COD') // COD or ONLINE
  const [loading, setLoading] = useState(false)
  const [showOnlineModal, setShowOnlineModal] = useState(false)

  const items = cart?.items || []

  useEffect(() => {
    if (!loading && items.length === 0) {
      navigate('/cart')
    }
  }, [items, loading, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmitOrder = async () => {
    setLoading(true)
    try {
      const shippingAddress = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
      }
      
      const res = await orderAPI.create({
        shippingAddress,
        note: form.note,
        paymentMethod,
      })

      toast.success('Đặt đơn hàng thành công! 🌸')
      await fetchCart() // Refresh cart
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng.')
      return
    }

    if (paymentMethod === 'ONLINE') {
      setShowOnlineModal(true)
    } else {
      handleSubmitOrder()
    }
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-12 pb-24">
      {/* Title */}
      <div className="mb-10 sm:mb-12 border-b border-wabi-border/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#3d2b1a] font-serif">Thanh Toán</h1>
        <p className="text-sm text-wabi-muted mt-2">Điền thông tin nhận hàng và chọn hình thức thanh toán</p>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-10 xl:gap-14 items-start">
        {/* Shipping Address Form */}
        <div className="space-y-8">
          <div className="rounded-[28px] bg-white border border-wabi-border/60 p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#3d2b1a] font-serif flex items-center gap-2 border-b border-wabi-border/40 pb-4">
              <svg className="w-5 h-5 text-wabi-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Thông tin giao hàng
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4d3b2b]">Họ tên người nhận *</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="h-13 w-full rounded-xl border border-[#e5d9cb] bg-[#fcfaf8] px-4 text-sm text-[#3d2b1a] outline-none transition-all focus:border-[#5a7247] focus:bg-white focus:ring-4 focus:ring-[#5a7247]/10"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4d3b2b]">Số điện thoại *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  className="h-13 w-full rounded-xl border border-[#e5d9cb] bg-[#fcfaf8] px-4 text-sm text-[#3d2b1a] outline-none transition-all focus:border-[#5a7247] focus:bg-white focus:ring-4 focus:ring-[#5a7247]/10"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-bold text-[#4d3b2b]">Địa chỉ chi tiết (Số nhà, Tên đường, Phường/Xã) *</label>
                <input
                  name="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Số 12, Đường số 3..."
                  className="h-13 w-full rounded-xl border border-[#e5d9cb] bg-[#fcfaf8] px-4 text-sm text-[#3d2b1a] outline-none transition-all focus:border-[#5a7247] focus:bg-white focus:ring-4 focus:ring-[#5a7247]/10"
                />
              </div>

              {/* City */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-bold text-[#4d3b2b]">Tỉnh / Thành phố *</label>
                <input
                  name="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="TP. Hồ Chí Minh"
                  className="h-13 w-full rounded-xl border border-[#e5d9cb] bg-[#fcfaf8] px-4 text-sm text-[#3d2b1a] outline-none transition-all focus:border-[#5a7247] focus:bg-white focus:ring-4 focus:ring-[#5a7247]/10"
                />
              </div>

              {/* Note */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-bold text-[#4d3b2b]">Ghi chú giao hàng (Không bắt buộc)</label>
                <textarea
                  name="note"
                  rows="3"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  className="w-full rounded-xl border border-[#e5d9cb] bg-[#fcfaf8] p-4 text-sm text-[#3d2b1a] outline-none transition-all focus:border-[#5a7247] focus:bg-white focus:ring-4 focus:ring-[#5a7247]/10"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods Choice */}
          <div className="rounded-[28px] bg-white border border-wabi-border/60 p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#3d2b1a] font-serif flex items-center gap-2 border-b border-wabi-border/40 pb-4">
              <svg className="w-5 h-5 text-wabi-red" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Phương thức thanh toán
            </h2>

            <div className="space-y-4">
              {/* COD */}
              <label className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${paymentMethod === 'COD' ? 'border-[#b5503a] bg-[#fffaf9]' : 'border-[#e5d9cb] bg-[#fcfaf8] hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 h-4 w-4 text-[#b5503a] border-gray-300 focus:ring-[#b5503a]"
                />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-[#3d2b1a]">Thanh toán khi nhận hàng (COD) - Bắt buộc</span>
                  <p className="text-xs text-wabi-muted">Bạn sẽ thanh toán tiền mặt trực tiếp cho shipper khi nhận được truyện.</p>
                </div>
              </label>

              {/* Online simulator */}
              <label className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${paymentMethod === 'ONLINE' ? 'border-[#b89b5e] bg-[#fffcf5]' : 'border-[#e5d9cb] bg-[#fcfaf8] hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="mt-1 h-4 w-4 text-[#b89b5e] border-gray-300 focus:ring-[#b89b5e]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#3d2b1a]">Thanh toán trực tuyến (Simulated MoMo / QR Bank)</span>
                    <span className="rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2.5 py-0.5">Khuyên dùng</span>
                  </div>
                  <p className="text-xs text-wabi-muted">Quét mã QR trực quan cực kỳ tiện lợi để thanh toán ngay lập tức.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Details Preview Sidebar */}
        <div className="rounded-[28px] bg-gradient-to-br from-[#fffaf5] to-[#f7efe7] border border-[#eadfd2] p-6 shadow-[0_10px_30px_rgba(61,43,26,0.05)] space-y-6">
          <h2 className="text-xl font-bold text-[#3d2b1a] font-serif border-b border-[#eadfd2] pb-4">Đơn hàng của bạn</h2>

          {/* Cart products list */}
          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 divide-y divide-[#eadfd2]/50">
            {items.map((item) => {
              const comic = item.comic
              if (!comic) return null
              const finalPrice = comic.price * (1 - (comic.discount || 0) / 100)
              
              return (
                <div key={item._id} className="flex gap-3 pt-4 first:pt-0">
                  <img
                    src={comic.images?.[0]}
                    alt={comic.title}
                    className="w-12 h-16 object-cover rounded-lg border border-wabi-border bg-[#f8f5f1]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#3d2b1a] leading-tight truncate">{comic.title}</h4>
                    <p className="text-[10px] text-wabi-muted mt-1">Số lượng: {item.quantity}</p>
                    <p className="text-xs font-black text-wabi-red mt-1">{formatPrice(finalPrice)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-[#eadfd2] pt-4 space-y-3 text-sm">
            <div className="flex justify-between text-wabi-secondary">
              <span>Tổng số lượng</span>
              <span className="font-bold">{totalItems} cuốn</span>
            </div>
            <div className="flex justify-between text-wabi-secondary">
              <span>Tạm tính</span>
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
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-wabi-red text-white font-bold text-[15px] shadow-lg shadow-red-500/20 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : paymentMethod === 'ONLINE' ? (
              'Quét mã thanh toán trực tuyến'
            ) : (
              'Xác nhận đặt hàng (COD)'
            )}
          </button>

          <Link
            to="/cart"
            className="w-full h-14 rounded-2xl bg-white border border-[#d9cbb8] text-wabi-brown font-bold text-[15px] hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            Quay lại giỏ hàng
          </Link>
        </div>
      </form>

      {/* ONLINE PAYMENT QR SIMULATOR MODAL */}
      {showOnlineModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-[32px] bg-white border border-wabi-border p-6 sm:p-8 space-y-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowOnlineModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#8f7b68] hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-[#3d2b1a] font-serif">Mã Thanh Toán QR</h3>
              <p className="text-xs text-wabi-muted">Quét mã QR dưới đây bằng ứng dụng Ngân hàng hoặc ví MoMo để chuyển khoản.</p>
            </div>

            {/* QR Image Simulator */}
            <div className="bg-[#f8f5f1] rounded-[24px] border border-wabi-border/60 p-5 flex flex-col items-center justify-center gap-4">
              <div className="relative bg-white p-4 rounded-2xl border border-wabi-border/40 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    `MangaStore Payment | Order Total: ${totalPrice} VND | Account: 0987654321`
                  )}&color=b5503a`}
                  alt="Simulated QR Code"
                  className="w-48 h-48"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-black/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">Quét mã ảo</span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-black text-wabi-red">{formatPrice(totalPrice)}</p>
                <p className="text-[11px] text-[#6b5744]">Số tài khoản: <span className="font-bold">0987654321</span></p>
                <p className="text-[11px] text-[#6b5744]">Ngân hàng: <span className="font-bold">MB Bank (MangaStore)</span></p>
                <p className="text-[11px] text-[#6b5744]">Nội dung: <span className="font-bold">MANGASTORE {form.phone}</span></p>
              </div>
            </div>

            {/* Simulated Confirm & Cancel Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowOnlineModal(false)
                  handleSubmitOrder()
                }}
                disabled={loading}
                className="w-full h-13 rounded-xl bg-wabi-red text-white font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                {loading ? 'Đang xác thực...' : 'Tôi đã chuyển khoản thành công'}
              </button>
              
              <button
                onClick={() => setShowOnlineModal(false)}
                className="w-full h-13 rounded-xl bg-white border border-[#d9cbb8] text-wabi-brown font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Huỷ / Chọn phương thức khác
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage
