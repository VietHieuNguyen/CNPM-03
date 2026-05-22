const express = require("express")
const router = express.Router()
const controller = require("../../controller/client/auth.controller")
const authMiddleware = require("../../middlewares/auth.middleware")

router.get("/", controller.index)
router.post("/register", controller.register)
router.post("/login", controller.login)
router.post("/logout", authMiddleware, controller.logout)
router.get("/profile", authMiddleware, controller.profile)
router.post("/refresh-token", controller.refreshToken)

module.exports = router