const rateLimit = require("express-rate-limit");

// Cấu hình giới hạn tần suất yêu cầu (Rate Limiter) chung cho toàn bộ API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200, // Tối đa 200 requests từ mỗi IP trong windowMs
  standardHeaders: true, // Trả về thông tin giới hạn trong header `RateLimit-*`
  legacyHeaders: false, // Vô hiệu hóa header X-RateLimit-*
  message: {
    success: false,
    message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.",
  },
});

// Cấu hình giới hạn tần suất nghiêm ngặt cho các route đăng nhập, đăng ký, quên mật khẩu
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20, // Tối đa 20 requests từ mỗi IP trong windowMs cho các tác vụ nhạy cảm
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Tài khoản đang thực hiện quá nhiều thao tác đăng nhập/xác thực. Vui lòng thử lại sau 15 phút.",
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
};
