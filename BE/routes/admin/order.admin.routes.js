const express = require("express")
const router = express.Router()
const controller = require("../../controller/admin/order.admin.controller")

router.get("/", controller.list)
router.get("/:id", controller.detail)
router.patch("/:id/status", controller.updateStatus)
router.patch("/:id/payment", controller.updatePaymentStatus)

module.exports = router
