const express = require("express")
const router = express.Router()
const controller = require("../../controller/admin/category.admin.controller")
const { upload } = require("../../middlewares/upload.middleware")

router.get("/", controller.list)
router.post("/", upload.single("image"), controller.create)
router.put("/:id", upload.single("image"), controller.update)
router.delete("/:id", controller.remove)

module.exports = router
