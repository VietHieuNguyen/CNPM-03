const express = require("express")
const router = express.Router()
const controller = require("../../controller/client/auth.controller")
const authMiddleware = require("../../middlewares/auth.middleware")
const { upload } = require("../../middlewares/upload.middleware")

router.get("/", controller.index)
router.post("/register", controller.register)
router.post("/login", controller.login)
router.post("/logout", authMiddleware, controller.logout)
router.get("/profile", authMiddleware, controller.profile)
router.patch("/profile", authMiddleware, upload.single("avatar"), controller.updateProfile)
router.post("/upload-image", authMiddleware, upload.single("file"), controller.uploadImage)
router.post("/refresh-token", controller.refreshToken)
router.post("/forgot-password", controller.forgotPassword)
router.post("/reset-password", controller.resetPassword)

// Address Book routes
router.get("/addresses", authMiddleware, controller.getAddresses)
router.post("/addresses", authMiddleware, controller.addAddress)
router.put("/addresses/:addressId", authMiddleware, controller.updateAddress)
router.delete("/addresses/:addressId", authMiddleware, controller.deleteAddress)
router.patch("/addresses/:addressId/default", authMiddleware, controller.setDefaultAddress)

module.exports = router