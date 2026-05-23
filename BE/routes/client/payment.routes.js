const express = require("express");
const router = express.Router();
const paymentController = require("../../controller/client/payment.controller");

// SePay webhook triggers payment status updates without user authentication requirement
router.post("/sepay-webhook", paymentController.sepayWebhook);

// Get SePay dynamic configurations (bankName, accountNo, accountName) for frontend VietQR
router.get("/config", paymentController.getPaymentConfig);

module.exports = router;
