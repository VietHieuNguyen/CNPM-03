const comicAdminRoutes = require("./comic.admin.routes")
const categoryAdminRoutes = require("./category.admin.routes")
const userAdminRoutes = require("./user.admin.routes")
const orderAdminRoutes = require("./order.admin.routes")
const authMiddleware = require("../../middlewares/auth.middleware")
const adminMiddleware = require("../../middlewares/admin.middleware")
const versionAPI = require("../../config/systemConfig")

const adminRoutes = (app) => {
  // Tất cả admin routes đều cần xác thực + quyền admin
  app.use(`/api/${versionAPI}/admin/comics`, authMiddleware, adminMiddleware, comicAdminRoutes)
  app.use(`/api/${versionAPI}/admin/categories`, authMiddleware, adminMiddleware, categoryAdminRoutes)
  app.use(`/api/${versionAPI}/admin/users`, authMiddleware, adminMiddleware, userAdminRoutes)
  app.use(`/api/${versionAPI}/admin/orders`, authMiddleware, adminMiddleware, orderAdminRoutes)
}

module.exports = adminRoutes
