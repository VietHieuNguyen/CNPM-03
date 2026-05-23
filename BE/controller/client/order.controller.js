const Order = require("../../model/Order")
const Cart = require("../../model/Cart")
const Comic = require("../../model/Comic")

// Helper function to auto-confirm orders that are older than 30 minutes
const checkAutoConfirm = async (order) => {
  if (order.status === "pending") {
    const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
    if (elapsedMinutes >= 30) {
      order.status = "confirmed"
      await order.save()
    }
  }
  return order
}

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, note = "", paymentMethod = "COD" } = req.body

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin giao hàng.",
      })
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.comic")
    if (!cart) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng của bạn đang trống.",
      })
    }

    // Clean up null/deleted comics on the fly
    const initialLength = cart.items.length
    cart.items = cart.items.filter(item => item.comic !== null)
    if (cart.items.length !== initialLength) {
      await cart.save()
    }

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng của bạn đang trống sau khi gỡ bỏ các sản phẩm không còn tồn tại.",
      })
    }

    // Verify stock and prepare order items
    const orderItems = []
    let totalAmount = 0

    for (const item of cart.items) {
      if (item.comic.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Truyện "${item.comic.title}" không đủ hàng trong kho (Còn lại ${item.comic.stock} cuốn).`,
        })
      }
      const finalPrice = item.comic.price * (1 - (item.comic.discount || 0) / 100)
      orderItems.push({
        comic: item.comic._id,
        title: item.comic.title,
        image: item.comic.images?.[0] || "",
        price: finalPrice,
        quantity: item.quantity,
      })
      totalAmount += finalPrice * item.quantity
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      status: "pending",
      paymentMethod,
      paymentStatus: "pending", // Payment is verified via SePay webhook or cashier
      shippingAddress,
      note,
    })

    // Deduct stock
    for (const item of cart.items) {
      item.comic.stock -= item.quantity
      item.comic.sold = (item.comic.sold || 0) + item.quantity
      await item.comic.save()
    }

    // Clear cart
    cart.items = []
    await cart.save()

    res.status(201).json({
      success: true,
      message: "Đặt đơn hàng thành công!",
      data: order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo đơn hàng.",
      error: error.message,
    })
  }
}

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    
    // Process auto confirm for any pending orders
    const processedOrders = []
    for (const order of orders) {
      const processed = await checkAutoConfirm(order)
      processedOrders.push(processed)
    }

    res.status(200).json({
      success: true,
      data: processedOrders,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy lịch sử đơn hàng.",
      error: error.message,
    })
  }
}

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    let order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate("items.comic")
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng.",
      })
    }

    order = await checkAutoConfirm(order)

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy chi tiết đơn hàng.",
      error: error.message,
    })
  }
}

// POST /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng.",
      })
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được huỷ từ trước.",
      })
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đơn hàng đã giao thành công.",
      })
    }

    const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
    const isLessThan30Min = elapsedMinutes < 30

    // Rule: Cancel directly if < 30 mins and status is pending or confirmed
    // Rule: Send cancel request if >= 30 mins OR status is preparing
    if (order.status === "preparing" || !isLessThan30Min) {
      if (order.status === "shipping" || order.status === "delivered") {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng đang được giao hoặc đã giao thành công, không thể yêu cầu hủy.",
        })
      }
      
      order.cancelRequest = true
      await order.save()

      return res.status(200).json({
        success: true,
        message: "Đã gửi yêu cầu hủy đơn hàng cho shop xét duyệt.",
        data: order,
      })
    }

    // Direct cancel (elapsedMinutes < 30 && status is pending or confirmed)
    order.status = "cancelled"
    await order.save()

    // Refund stock
    for (const item of order.items) {
      const comic = await Comic.findById(item.comic)
      if (comic) {
        comic.stock += item.quantity
        comic.sold = Math.max(0, (comic.sold || 0) - item.quantity)
        await comic.save()
      }
    }

    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công!",
      data: order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi hủy đơn hàng.",
      error: error.message,
    })
  }
}
