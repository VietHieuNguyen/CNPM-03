const Order = require("../../model/Order");

// POST /api/v1/payment/sepay-webhook
exports.sepayWebhook = async (req, res) => {
  try {
    const { transactionContent, amountIn, gateway, transactionDate, referenceNumber } = req.body;

    console.log("[SEPAY WEBHOOK] Received payment notification:", {
      transactionContent,
      amountIn,
      gateway,
      transactionDate,
      referenceNumber,
    });

    // Check optional API Key security from headers if configured in .env
    const authHeader = req.headers.authorization;
    if (process.env.SEPAY_API_KEY && process.env.SEPAY_API_KEY.trim() !== "") {
      const expectedAuth = `Bearer ${process.env.SEPAY_API_KEY}`;
      if (authHeader !== expectedAuth) {
        console.warn("[SEPAY WEBHOOK] Unauthorized request. API Key mismatch.");
        return res.status(401).json({
          success: false,
          message: "Mã bảo mật SePay không hợp lệ.",
        });
      }
    }

    if (!transactionContent || !amountIn) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin nội dung chuyển khoản hoặc số tiền.",
      });
    }

    // Try to match KOM-XXXXXX or KOMXXXXXX where XXXXXX is the 6-hex-digit suffix of the Order MongoDB ObjectId
    const regex = /KOM-?([A-F0-9]{6})/i;
    const match = transactionContent.match(regex);

    if (!match) {
      console.warn(`[SEPAY WEBHOOK] Could not parse order code from transaction description: "${transactionContent}"`);
      return res.status(400).json({
        success: false,
        message: "Nội dung chuyển khoản không khớp định dạng đơn hàng KOM-XXXXXX.",
      });
    }

    const orderSuffix = match[1].toUpperCase();
    console.log(`[SEPAY WEBHOOK] Extracted order suffix: "${orderSuffix}". Finding matching order...`);

    // Fetch all pending / unpaid orders to match the suffix
    const orders = await Order.find({
      paymentStatus: { $ne: "paid" },
      status: { $nin: ["cancelled", "delivered"] },
    });

    const targetOrder = orders.find(
      (ord) => ord._id.toString().slice(-6).toUpperCase() === orderSuffix
    );

    if (!targetOrder) {
      console.warn(`[SEPAY WEBHOOK] No active unpaid order found matching suffix "${orderSuffix}"`);
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đơn hàng tương ứng với mã đuôi ${orderSuffix}.`,
      });
    }

    console.log(`[SEPAY WEBHOOK] Found order: ID = ${targetOrder._id}, totalAmount = ${targetOrder.totalAmount}`);

    // Verify amount
    if (amountIn < targetOrder.totalAmount) {
      console.warn(
        `[SEPAY WEBHOOK] Insufficient amount received. Expected >= ${targetOrder.totalAmount}, got ${amountIn}`
      );
      return res.status(400).json({
        success: false,
        message: `Số tiền thanh toán (${amountIn}đ) ít hơn số tiền đơn hàng (${targetOrder.totalAmount}đ).`,
      });
    }

    // Update order status to paid and confirmed
    targetOrder.paymentStatus = "paid";
    targetOrder.status = "confirmed"; // Auto-confirm because payment is completed!
    
    // Save order note about payment details
    targetOrder.note = `${targetOrder.note || ""}\n[SePay] Đã nhận ${amountIn}đ qua ${gateway} lúc ${transactionDate}. Mã GD: ${referenceNumber}.`.trim();

    await targetOrder.save();

    console.log(`[SEPAY WEBHOOK] Order ${targetOrder._id} successfully marked as PAID.`);

    return res.status(200).json({
      success: true,
      message: "Thanh toán đơn hàng thành công!",
      data: {
        orderId: targetOrder._id,
        amountReceived: amountIn,
      },
    });
  } catch (err) {
    console.error("[SEPAY WEBHOOK] Critical error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống xử lý Webhook SePay.",
      error: err.message,
    });
  }
};

// GET /api/v1/payment/config
exports.getPaymentConfig = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        bankName: process.env.SEPAY_BANK_NAME || "vietcombank",
        accountNo: process.env.SEPAY_ACCOUNT_NO || "0123456789",
        accountName: process.env.SEPAY_ACCOUNT_NAME || "NGUYEN VIET HIEU",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy cấu hình ngân hàng thanh toán.",
      error: error.message,
    });
  }
};
