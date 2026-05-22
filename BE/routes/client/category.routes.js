const express = require("express")
const router = express.Router()
const controller = require("../../controller/client/category.controller")

router.get("/", controller.list)
router.get("/:slug", controller.detail)

module.exports = router
