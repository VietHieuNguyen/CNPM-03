const Comic = require("../../model/Comic")

// GET /api/v1/comics — danh sách + tìm kiếm + lọc
module.exports.list = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      tags,
      status,
      sort,
      page = 1,
      limit = 12,
    } = req.query

    const filter = { status: "active" }

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { author: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
      ]
    }

    if (category) filter.category = category

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    if (tags) {
      const tagList = Array.isArray(tags) ? tags : tags.split(",")
      filter.tags = { $in: tagList }
    }

    if (status === "available") filter.stock = { $gt: 0 }
    if (status === "outofstock") filter.stock = 0

    // Sorting
    let sortOption = { createdAt: -1 }
    if (sort === "price_asc") sortOption = { price: 1 }
    else if (sort === "price_desc") sortOption = { price: -1 }
    else if (sort === "bestseller") sortOption = { sold: -1 }
    else if (sort === "rating") sortOption = { "rating.avg": -1 }
    else if (sort === "newest") sortOption = { createdAt: -1 }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Comic.countDocuments(filter)
    const comics = await Comic.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))

    return res.status(200).json({
      success: true,
      data: {
        comics,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    })
  } catch (error) {
    console.error("Comics list error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// GET /api/v1/comics/featured
module.exports.featured = async (req, res) => {
  try {
    const comics = await Comic.find({ isFeatured: true, status: "active" })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(8)
    return res.status(200).json({ success: true, data: { comics } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// GET /api/v1/comics/new
module.exports.newComics = async (req, res) => {
  try {
    const comics = await Comic.find({ isNew: true, status: "active" })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(8)
    return res.status(200).json({ success: true, data: { comics } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// GET /api/v1/comics/bestseller
module.exports.bestseller = async (req, res) => {
  try {
    const comics = await Comic.find({ isBestSeller: true, status: "active" })
      .populate("category", "name slug")
      .sort({ sold: -1 })
      .limit(8)
    return res.status(200).json({ success: true, data: { comics } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// GET /api/v1/comics/similar/:categoryId
module.exports.similar = async (req, res) => {
  try {
    const { categoryId } = req.params
    const { excludeId } = req.query
    const filter = { category: categoryId, status: "active" }
    if (excludeId) filter._id = { $ne: excludeId }

    const comics = await Comic.find(filter)
      .populate("category", "name slug")
      .sort({ sold: -1 })
      .limit(6)
    return res.status(200).json({ success: true, data: { comics } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// GET /api/v1/comics/:slug — chi tiết
module.exports.detail = async (req, res) => {
  try {
    const comic = await Comic.findOne({ slug: req.params.slug, status: "active" }).populate(
      "category",
      "name slug"
    )
    if (!comic) {
      return res.status(404).json({ success: false, message: "Không tìm thấy truyện." })
    }
    return res.status(200).json({ success: true, data: { comic } })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}
