import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../api'
import toast from 'react-hot-toast'
import { IconHistory, IconBook } from '../components/Icons'

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const STATUS_MAP = {
  pending: { label: 'Đơn hàng mới', color: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-emerald-100 text-emerald-800' },
  preparing: { label: 'Shop đang chuẩn bị hàng', color: 'bg-yellow-100 text-yellow-800' },
  shipping: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Đã giao thành công', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã huỷ đơn hàng', color: 'bg-red-100 text-red-800' },
}

const STEPS = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered']

const OrderTrackingPage = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.list()
      const list = res.data.data
      setOrders(list)
      
      // Keep selected order in sync
      if (selectedOrder) {
        const updated = list.find((o) => o._id === selectedOrder._id)
        if (updated) setSelectedOrder(updated)
      } else if (list.length > 0) {
        setSelectedOrder(list[0])
      }
    } catch {
      toast.error('Không thể lấy danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleCancelOrder = async (orderId) => {
    setCancellingId(orderId)
    try {
      const res = await orderAPI.cancel(orderId)
      toast.success(res.data.message || 'Huỷ đơn đặt hàng thành công!')
      await fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi huỷ đơn hàng.')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-20 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-wabi-red/20 border-t-wabi-red rounded-full animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f8f5f1] flex items-center justify-center mx-auto mb-6">
          <IconHistory className="w-9 h-9 text-[#8f7b68]" />
        </div>
        <h2 className="text-2xl font-black text-wabi-text font-serif mb-3">Bạn chưa có đơn đặt hàng nào</h2>
        <p className="text-wabi-muted text-[15px] mb-8 max-w-md mx-auto">
          Các đơn hàng bạn đã mua sẽ xuất hiện tại đây để bạn có thể dễ dàng theo dõi trạng thái vận chuyển.
        </p>
        <Link to="/search" className="btn-primary inline-flex px-8 py-3.5 rounded-2xl">
          Mua truyện ngay
        </Link>
      </div>
    )
  }

  // Calculate elapsed time and cancel eligibility
  const getCancelState = (order) => {
    if (!order) return { canCancel: false, showRequest: false }
    if (order.status === 'cancelled' || order.status === 'delivered' || order.status === 'shipping') {
      return { canCancel: false, showRequest: false }
    }
    
    const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
    const isLessThan30Min = elapsedMinutes < 30

    // Direct cancel allowed if < 30 minutes AND status is pending or confirmed
    if (isLessThan30Min && (order.status === 'pending' || order.status === 'confirmed')) {
      return { canCancel: true, showRequest: false }
    }
    
    // Cancellation request required if >= 30 minutes OR status is preparing
    if (order.status === 'preparing' || !isLessThan30Min) {
      return { canCancel: true, showRequest: true }
    }

    return { canCancel: false, showRequest: false }
  }

  const cancelState = getCancelState(selectedOrder)
  const currentStepIndex = selectedOrder ? STEPS.indexOf(selectedOrder.status) : -1

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-12 pb-24">
      {/* Title */}
      <div className="mb-10 sm:mb-12 border-b border-wabi-border/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#3d2b1a] font-serif">Đơn Hàng Của Tôi</h1>
        <p className="text-sm text-wabi-muted mt-2">Xem lại lịch sử mua hàng và theo dõi trạng thái đơn hàng thời gian thực</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 xl:gap-14 items-start">
        {/* Left: Orders List History */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-wabi-text font-serif mb-2">Lịch sử đơn hàng</h3>
          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
            {orders.map((order) => {
              const isSelected = selectedOrder?._id === order._id
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
              const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })

              return (
                <button
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${isSelected ? 'border-[#b5503a] bg-[#fffaf9] shadow-sm' : 'border-wabi-border/60 bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[12px] font-black text-wabi-brown uppercase tracking-wider">Mã: #{order._id.slice(-6).toUpperCase()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-wabi-text line-clamp-1">
                      {order.items.map((i) => i.title).join(', ')}
                    </h4>
                    <p className="text-[11px] text-wabi-muted">{orderDate}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#eadfd2]/50 pt-3">
                    <span className="text-xs text-wabi-secondary">Tổng tiền:</span>
                    <span className="text-sm font-black text-wabi-red">{formatPrice(order.totalAmount)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Selected Order Detail & Real-Time Tracking Progress */}
        {selectedOrder && (
          <div className="space-y-8 animate-fade-up">
            {/* Real-time Step Progress Tracker */}
            <div className="rounded-[28px] bg-white border border-wabi-border/60 p-6 sm:p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-wabi-border/40 pb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-bold text-wabi-text font-serif">Theo dõi đơn hàng #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
                  <p className="text-xs text-wabi-muted mt-1">Đặt ngày: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-wabi-secondary">Thanh toán:</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {selectedOrder.paymentMethod === 'ONLINE' ? 'Trực tuyến (Đã trả)' : 'COD (Chưa trả)'}
                  </span>
                </div>
              </div>

              {/* Steps visual graphic */}
              {selectedOrder.status === 'cancelled' ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-wabi-red text-sm">
                  <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-extrabold text-base">Đơn hàng này đã bị hủy thành công</h4>
                    <p className="text-xs text-red-600/80 mt-1">Cảm ơn bạn đã lựa chọn MangaStore. Rất mong được phục vụ bạn lần sau!</p>
                  </div>
                </div>
              ) : (
                <div className="relative py-4">
                  {/* Progress Line */}
                  <div className="absolute top-[28px] left-[10%] right-[10%] h-[3px] bg-gray-200 -z-10 hidden sm:block">
                    <div
                      className="h-full bg-wabi-green transition-all duration-500"
                      style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STEPS.length - 1)) * 100 : 0}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-0 justify-items-center">
                    {STEPS.map((step, idx) => {
                      const isActive = idx <= currentStepIndex
                      const isCurrent = idx === currentStepIndex
                      
                      const stepTitles = {
                        pending: 'Đơn hàng mới',
                        confirmed: 'Đã xác nhận',
                        preparing: 'Đang soạn hàng',
                        shipping: 'Đang giao hàng',
                        delivered: 'Đã giao thành công',
                      }

                      return (
                        <div key={step} className="flex sm:flex-col items-center gap-4 sm:gap-2.5 text-center w-full">
                          {/* Dot Circle */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 border-2 ${isCurrent ? 'bg-wabi-green border-wabi-green text-white scale-110 ring-4 ring-wabi-green/10' : isActive ? 'bg-wabi-green border-wabi-green text-white' : 'bg-white border-wabi-border text-wabi-muted'}`}>
                            {idx + 1}
                          </div>

                          <div className="text-left sm:text-center space-y-0.5">
                            <span className={`block text-xs font-bold uppercase tracking-wide ${isActive ? 'text-wabi-text' : 'text-wabi-muted'}`}>
                              {stepTitles[step]}
                            </span>
                            {isCurrent && (
                              <span className="inline-block text-[9px] font-bold text-wabi-green bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                Hiện tại
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Address details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#faf8f5] border border-wabi-border/40 rounded-2xl p-5 text-sm text-[#4d3b2b]">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#3d2b1a] uppercase text-[11px] tracking-wider text-wabi-muted">Thông tin nhận hàng</h4>
                  <p className="font-bold text-sm">{selectedOrder.shippingAddress.name}</p>
                  <p>SĐT: {selectedOrder.shippingAddress.phone}</p>
                  <p>Địa chỉ: {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#3d2b1a] uppercase text-[11px] tracking-wider text-wabi-muted">Ghi chú & Phương thức</h4>
                  <p>Phương thức: <span className="font-bold">{selectedOrder.paymentMethod === 'ONLINE' ? 'Chuyển khoản trực tuyến' : 'Thanh toán COD'}</span></p>
                  <p>Ghi chú: {selectedOrder.note || <span className="text-wabi-muted italic">Không có ghi chú</span>}</p>
                  {selectedOrder.cancelRequest && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-yellow-800 bg-yellow-100 px-2.5 py-1 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
                      Đang gửi yêu cầu hủy cho shop xét duyệt
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items & Subtotal details */}
            <div className="rounded-[28px] bg-white border border-wabi-border/60 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-wabi-text font-serif border-b border-wabi-border/40 pb-4">Chi tiết đơn hàng</h3>
              
              <div className="divide-y divide-[#eadfd2]/40">
                {selectedOrder.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                    <div className="flex gap-4 items-center">
                      <img
                        src={item.image || 'https://placehold.co/80x110'}
                        alt={item.title}
                        className="w-12 h-18 object-cover rounded-lg border border-wabi-border bg-[#f8f5f1]"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-wabi-text leading-tight">{item.title}</h4>
                        <p className="text-xs text-wabi-muted mt-1">Đơn giá: {formatPrice(item.price)}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-wabi-muted">SL: {item.quantity}</p>
                      <p className="font-black text-sm text-[#3d2b1a] mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#eadfd2]/60 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                {/* Cancellation trigger actions */}
                {cancelState.canCancel && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    disabled={cancellingId === selectedOrder._id || selectedOrder.cancelRequest}
                    className={`h-11 px-6 rounded-xl font-bold text-xs shadow-sm transition-all duration-300 flex items-center justify-center cursor-pointer ${
                      selectedOrder.cancelRequest
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : cancelState.showRequest
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100'
                        : 'bg-red-50 text-wabi-red border border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {cancellingId === selectedOrder._id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : selectedOrder.cancelRequest ? (
                      'Đã gửi yêu cầu hủy đơn'
                    ) : cancelState.showRequest ? (
                      'Gửi Yêu cầu hủy đơn cho shop'
                    ) : (
                      'Hủy đơn hàng'
                    )}
                  </button>
                )}

                <div className="ml-auto flex items-baseline gap-4 text-sm text-[#4d3b2b]">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-2xl font-black text-wabi-red">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTrackingPage
