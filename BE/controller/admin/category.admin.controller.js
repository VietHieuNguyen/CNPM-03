const Category = require("../../model/Category")

const slugify = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

// GET /api/v1/admin/categories
module.exports.list = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    return res.status(200).json({ success: true, data: { categories } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/admin/categories
module.exports.create = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ success: false, message: "Tên danh mục là bắt buộc." })

    let slug = slugify(name)
    const existing = await Category.findOne({ slug })
    if (existing) slug = `${slug}-${Date.now()}`

    const image = req.file ? req.file.path : ""
    const category = await Category.create({ name, slug, description, image })
    return res.status(201).json({ success: true, message: "Thêm danh mục thành công!", data: { category } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// PUT /api/v1/admin/categories/:id
module.exports.update = async (req, res) => {
  try {
    const updates = { ...req.body }
    if (req.file) updates.image = req.file.path
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!category) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục." })
    return res.status(200).json({ success: true, message: "Cập nhật thành công!", data: { category } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// DELETE /api/v1/admin/categories/:id
module.exports.remove = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    return res.status(200).json({ success: true, message: "Xoá danh mục thành công!" })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}
