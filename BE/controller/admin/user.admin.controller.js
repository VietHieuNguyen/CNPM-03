const User = require("../../model/User")
const bcrypt = require("bcryptjs")

// GET /api/v1/admin/users
module.exports.list = async (req, res) => {
  try {
    const { keyword, role, page = 1, limit = 20 } = req.query
    const filter = {}
    if (keyword) filter.$or = [{ name: { $regex: keyword, $options: "i" } }, { email: { $regex: keyword, $options: "i" } }]
    if (role) filter.role = role

    const skip = (Number(page) - 1) * Number(limit)
    const total = await User.countDocuments(filter)
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
    return res.status(200).json({ success: true, data: { users, pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/admin/users — tạo tài khoản (kể cả admin)
module.exports.create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Thiếu thông tin." })

    const existUser = await User.findOne({ email })
    if (existUser) return res.status(409).json({ success: false, message: "Email đã tồn tại." })

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashedPassword, role: role || "member" })
    return res.status(201).json({ success: true, message: "Tạo tài khoản thành công!", data: { user } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// PUT /api/v1/admin/users/:id
module.exports.update = async (req, res) => {
  try {
    const updates = { ...req.body }
    delete updates.password
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user." })
    return res.status(200).json({ success: true, message: "Cập nhật thành công!", data: { user } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// DELETE /api/v1/admin/users/:id
module.exports.remove = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Không thể xoá chính mình." })
    }
    await User.findByIdAndDelete(req.params.id)
    return res.status(200).json({ success: true, message: "Xoá tài khoản thành công!" })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}
