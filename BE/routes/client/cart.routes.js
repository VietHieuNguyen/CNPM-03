const express = require("express")
const router = express.Router()
const controller = require("../../controller/client/cart.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

router.use(authMiddleware)

router.get("/", controller.getCart)
router.post("/", controller.addToCart)
router.put("/", controller.updateQuantity)
router.delete("/", controller.clearCart)
router.delete("/:comicId", controller.removeFromCart)

module.exports = router
