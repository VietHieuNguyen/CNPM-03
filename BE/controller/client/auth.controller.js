const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../../model/User")

// Helper: tạo token
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  })
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  })
  return { accessToken, refreshToken }
}

// Helper: set cookies
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 phút
  })
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  })
}

// POST /api/v1/user/register
module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin." })
    }

    const existUser = await User.findOne({ email })
    if (existUser) {
      return res.status(409).json({ success: false, message: "Email đã được sử dụng." })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashedPassword })

    const { accessToken, refreshToken } = generateTokens(user._id)
    await User.findByIdAndUpdate(user._id, { refreshToken })
    setCookies(res, accessToken, refreshToken)

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/user/login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin." })
    }

    const user = await User.findOne({ email }).select("+password")
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." })
    }

    const { accessToken, refreshToken } = generateTokens(user._id)
    await User.findByIdAndUpdate(user._id, { refreshToken })
    setCookies(res, accessToken, refreshToken)

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/user/logout
module.exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null })
    }
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    return res.status(200).json({ success: true, message: "Đăng xuất thành công!" })
  } catch (error) {
    console.error("Logout error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// GET /api/v1/user/profile
module.exports.profile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: { user: req.user },
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/user/refresh-token
module.exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) {
      return res.status(401).json({ success: false, message: "Không có refresh token." })
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id).select("+refreshToken")

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Refresh token không hợp lệ." })
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id)
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken })
    setCookies(res, accessToken, newRefreshToken)

    return res.status(200).json({ success: true, message: "Làm mới token thành công." })
  } catch (error) {
    return res.status(401).json({ success: false, message: "Refresh token hết hạn hoặc không hợp lệ." })
  }
}

// index (placeholder for old route)
module.exports.index = (req, res) => {
  res.json({ success: true, message: "Auth API v1" })
}