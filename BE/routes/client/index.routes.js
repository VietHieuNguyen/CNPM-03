const authRoutes = require("./auth.routes")
const comicRoutes = require("./comic.routes")
const categoryRoutes = require("./category.routes")
const cartRoutes = require("./cart.routes")
const orderRoutes = require("./order.routes")
const paymentRoutes = require("./payment.routes")

const versionAPI = require("../../config/systemConfig")

const clientRoutes = (app) => {
  app.use(`/api/${versionAPI}/user`, authRoutes)
  app.use(`/api/${versionAPI}/comics`, comicRoutes)
  app.use(`/api/${versionAPI}/categories`, categoryRoutes)
  app.use(`/api/${versionAPI}/cart`, cartRoutes)
  app.use(`/api/${versionAPI}/orders`, orderRoutes)
  app.use(`/api/${versionAPI}/payment`, paymentRoutes)
}

module.exports = clientRoutes