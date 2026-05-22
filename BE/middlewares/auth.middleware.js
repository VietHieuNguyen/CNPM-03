const jwt = require("jsonwebtoken")
const User = require("../model/User")

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    const user = await User.findById(decoded.id).select("-password -refreshToken")

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không hợp lệ hoặc đã bị khoá.",
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        code: "TOKEN_EXPIRED",
      })
    }
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ.",
    })
  }
}

module.exports = authMiddleware
