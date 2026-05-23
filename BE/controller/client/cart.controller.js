const Cart = require("../../model/Cart")
const Comic = require("../../model/Comic")

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.comic",
      populate: { path: "category" }
    })

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    res.status(200).json({
      success: true,
      data: cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy giỏ hàng.",
      error: error.message,
    })
  }
}

// POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { comicId, quantity = 1 } = req.body

    if (!comicId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã truyện.",
      })
    }

    const comic = await Comic.findById(comicId)
    if (!comic) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy truyện này.",
      })
    }

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.comic.toString() === comicId
    )

    let targetQuantity = quantity
    if (existingItemIndex > -1) {
      targetQuantity = cart.items[existingItemIndex].quantity + quantity
    }

    if (comic.stock < targetQuantity) {
      return res.status(400).json({
        success: false,
        message: `Số lượng yêu cầu vượt quá tồn kho hiện tại (${comic.stock} cuốn).`,
      })
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = targetQuantity
    } else {
      cart.items.push({ comic: comicId, quantity })
    }

    await cart.save()
    
    // Populate before sending back
    await cart.populate({
      path: "items.comic",
      populate: { path: "category" }
    })

    res.status(200).json({
      success: true,
      message: "Đã thêm truyện vào giỏ hàng.",
      data: cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi thêm vào giỏ hàng.",
      error: error.message,
    })
  }
}

// PUT /api/cart
exports.updateQuantity = async (req, res) => {
  try {
    const { comicId, quantity } = req.body

    if (!comicId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin cập nhật.",
      })
    }

    const comic = await Comic.findById(comicId)
    if (!comic) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy truyện này.",
      })
    }

    if (comic.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Số lượng yêu cầu vượt quá tồn kho hiện tại (${comic.stock} cuốn).`,
      })
    }

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng.",
      })
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.comic.toString() === comicId
    )

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không có trong giỏ hàng.",
      })
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }

    await cart.save()
    await cart.populate({
      path: "items.comic",
      populate: { path: "category" }
    })

    res.status(200).json({
      success: true,
      message: "Cập nhật số lượng thành công.",
      data: cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật giỏ hàng.",
      error: error.message,
    })
  }
}

// DELETE /api/cart/:comicId
exports.removeFromCart = async (req, res) => {
  try {
    const { comicId } = req.params

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng.",
      })
    }

    cart.items = cart.items.filter((item) => item.comic.toString() !== comicId)
    await cart.save()
    await cart.populate({
      path: "items.comic",
      populate: { path: "category" }
    })

    res.status(200).json({
      success: true,
      message: "Đã xóa truyện khỏi giỏ hàng.",
      data: cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa sản phẩm.",
      error: error.message,
    })
  }
}

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      cart.items = []
      await cart.save()
    }

    res.status(200).json({
      success: true,
      message: "Đã làm trống giỏ hàng.",
      data: cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa giỏ hàng.",
      error: error.message,
    })
  }
}
