const authRoutes = require("./auth.routes")
const comicRoutes = require("./comic.routes")
const categoryRoutes = require("./category.routes")

const versionAPI = require("../../config/systemConfig")

const clientRoutes = (app) => {
  app.use(`/api/${versionAPI}/user`, authRoutes)
  app.use(`/api/${versionAPI}/comics`, comicRoutes)
  app.use(`/api/${versionAPI}/categories`, categoryRoutes)
}

module.exports = clientRoutes