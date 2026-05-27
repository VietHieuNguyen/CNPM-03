const Order = require("../../model/Order")
const User = require("../../model/User")

// GET /api/v1/admin/orders
module.exports.list = async (req, res) => {
  try {
    const { keyword, status, page = 1, limit = 20 } = req.query
    const filter = {}

    if (status) {
      filter.status = status
    }

    if (keyword) {
      // Find users matching search keyword to filter by user
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ]
      }).select("_id")
      
      const userIds = matchingUsers.map(u => u._id)
      
      filter.$or = [
        { user: { $in: userIds } },
        { "shippingAddress.name": { $regex: keyword, $options: "i" } },
        { "shippingAddress.phone": { $regex: keyword, $options: "i" } },
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error("Admin order list error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// GET /api/v1/admin/orders/:id
module.exports.detail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.comic", "title slug code image")
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." })
    }
    
    return res.status(200).json({ success: true, data: { order } })
  } catch (error) {
    console.error("Admin order detail error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// PATCH /api/v1/admin/orders/:id/status
module.exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["pending", "confirmed", "preparing", "shipping", "delivered", "cancelled"]
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." })
    }

    order.status = status
    
    // Automatically set paymentStatus to paid if delivered and COD, etc.
    if (status === "delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "paid"
    }

    await order.save()
    return res.status(200).json({ success: true, message: "Cập nhật trạng thái đơn hàng thành công!", data: { order } })
  } catch (error) {
    console.error("Admin update order status error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// PATCH /api/v1/admin/orders/:id/payment
module.exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body
    const validPaymentStatuses = ["pending", "paid", "refunded"]
    
    if (!paymentStatus || !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Trạng thái thanh toán không hợp lệ." })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." })
    }

    order.paymentStatus = paymentStatus
    await order.save()
    return res.status(200).json({ success: true, message: "Cập nhật trạng thái thanh toán thành công!", data: { order } })
  } catch (error) {
    console.error("Admin update order payment status error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}
