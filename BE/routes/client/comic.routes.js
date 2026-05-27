const express = require("express")
const router = express.Router()
const controller = require("../../controller/client/comic.controller")

router.get("/featured", controller.featured)
router.get("/new", controller.newComics)
router.get("/bestseller", controller.bestseller)
router.get("/most-viewed", controller.mostViewed)
router.get("/similar/:categoryId", controller.similar)
router.get("/authors", controller.authors)
router.get("/", controller.list)
router.get("/:slug", controller.detail)

module.exports = router
