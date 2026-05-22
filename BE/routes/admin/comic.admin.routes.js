const express = require("express")
const router = express.Router()
const controller = require("../../controller/admin/comic.admin.controller")
const { upload } = require("../../middlewares/upload.middleware")

router.get("/", controller.list)
router.post("/", upload.array("images", 10), controller.create)
router.put("/:id", upload.array("images", 10), controller.update)
router.delete("/:id", controller.remove)
router.delete("/:id/images", controller.removeImage)

module.exports = router
