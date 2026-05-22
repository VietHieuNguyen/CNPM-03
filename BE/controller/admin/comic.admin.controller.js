const Comic = require("../../model/Comic")
const { cloudinary } = require("../../middlewares/upload.middleware")

// Helper: tạo slug từ title
const slugify = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

// GET /api/v1/admin/comics
module.exports.list = async (req, res) => {
  try {
    const { keyword, category, page = 1, limit = 20 } = req.query
    const filter = {}
    if (keyword) filter.title = { $regex: keyword, $options: "i" }
    if (category) filter.category = category

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Comic.countDocuments(filter)
    const comics = await Comic.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    return res.status(200).json({
      success: true,
      data: { comics, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } },
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/admin/comics
module.exports.create = async (req, res) => {
  try {
    const { title, author, description, price, discount, stock, category, tags, volumes, publisher, publishYear, isFeatured, isNew, isBestSeller } = req.body
    if (!title || !author || !price || !category) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc." })
    }

    let slug = slugify(title)
    const existing = await Comic.findOne({ slug })
    if (existing) slug = `${slug}-${Date.now()}`

    const images = req.files ? req.files.map((f) => f.path) : []
    const tagList = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags || []

    const comic = await Comic.create({
      title, slug, author, description, price: Number(price),
      discount: Number(discount) || 0, stock: Number(stock) || 0,
      images, category,
      tags: tagList,
      volumes: Number(volumes) || 1, publisher, publishYear,
      isFeatured: isFeatured === "true", isNew: isNew === "true", isBestSeller: isBestSeller === "true",
    })

    return res.status(201).json({ success: true, message: "Thêm truyện thành công!", data: { comic } })
  } catch (error) {
    console.error("Create comic error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// PUT /api/v1/admin/comics/:id
module.exports.update = async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id)
    if (!comic) return res.status(404).json({ success: false, message: "Không tìm thấy truyện." })

    const updates = { ...req.body }
    if (updates.tags && typeof updates.tags === "string") {
      updates.tags = updates.tags.split(",").map((t) => t.trim())
    }
    if (updates.price) updates.price = Number(updates.price)
    if (updates.discount) updates.discount = Number(updates.discount)
    if (updates.stock) updates.stock = Number(updates.stock)
    if (updates.isFeatured !== undefined) updates.isFeatured = updates.isFeatured === "true"
    if (updates.isNew !== undefined) updates.isNew = updates.isNew === "true"
    if (updates.isBestSeller !== undefined) updates.isBestSeller = updates.isBestSeller === "true"

    // Thêm ảnh mới nếu có
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => f.path)
      updates.images = [...(comic.images || []), ...newImages]
    }

    const updated = await Comic.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("category", "name slug")
    return res.status(200).json({ success: true, message: "Cập nhật thành công!", data: { comic: updated } })
  } catch (error) {
    console.error("Update comic error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// DELETE /api/v1/admin/comics/:id
module.exports.remove = async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id)
    if (!comic) return res.status(404).json({ success: false, message: "Không tìm thấy truyện." })

    // Xoá ảnh trên Cloudinary
    for (const imgUrl of comic.images) {
      const publicId = imgUrl.split("/").slice(-2).join("/").replace(/\.[^/.]+$/, "")
      await cloudinary.uploader.destroy(publicId).catch(() => {})
    }

    await Comic.findByIdAndDelete(req.params.id)
    return res.status(200).json({ success: true, message: "Xoá truyện thành công!" })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// DELETE /api/v1/admin/comics/:id/images — xoá 1 ảnh cụ thể
module.exports.removeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body
    const comic = await Comic.findById(req.params.id)
    if (!comic) return res.status(404).json({ success: false, message: "Không tìm thấy truyện." })

    const publicId = imageUrl.split("/").slice(-2).join("/").replace(/\.[^/.]+$/, "")
    await cloudinary.uploader.destroy(publicId).catch(() => {})

    comic.images = comic.images.filter((img) => img !== imageUrl)
    await comic.save()
    return res.status(200).json({ success: true, message: "Xoá ảnh thành công!", data: { images: comic.images } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}
