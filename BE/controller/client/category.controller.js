const Category = require("../../model/Category")

// GET /api/v1/categories
module.exports.list = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 })
    return res.status(200).json({ success: true, data: { categories } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// GET /api/v1/categories/:slug
module.exports.detail = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục." })
    }
    return res.status(200).json({ success: true, data: { category } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}
