const express = require("express")
const router = express.Router()
const controller = require("../../controller/client/order.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

router.use(authMiddleware)

router.post("/", controller.createOrder)
router.get("/", controller.getOrders)
router.get("/:id", controller.getOrderById)
router.post("/:id/cancel", controller.cancelOrder)

module.exports = router
