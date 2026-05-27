const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../../model/User")
const { sendEmail } = require("../../service/email.service")

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

// PATCH /api/v1/user/profile
module.exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body
    const updateData = {}

    if (name) updateData.name = name
    if (typeof bio === "string") updateData.bio = bio
    if (req.file && req.file.path) {
      updateData.avatar = req.file.path
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    )

    return res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ thành công!",
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          addresses: updatedUser.addresses,
        },
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/user/upload-image
module.exports.uploadImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: "Không tìm thấy file để upload." })
    }
    // Return standard format required by TinyMCE
    return res.status(200).json({
      location: req.file.path
    })
  } catch (error) {
    console.error("Upload image error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// GET /api/v1/user/addresses
module.exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    return res.status(200).json({
      success: true,
      data: user.addresses || []
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/user/addresses
module.exports.addAddress = async (req, res) => {
  try {
    const { name, phone, address, city, isDefault } = req.body
    if (!name || !phone || !address || !city) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ các thông tin bắt buộc." })
    }

    const user = await User.findById(req.user._id)
    
    let shouldBeDefault = isDefault || user.addresses.length === 0

    if (shouldBeDefault) {
      user.addresses.forEach(addr => addr.isDefault = false)
    }

    user.addresses.push({
      name,
      phone,
      address,
      city,
      isDefault: shouldBeDefault
    })

    await user.save()

    return res.status(201).json({
      success: true,
      message: "Thêm địa chỉ mới thành công!",
      data: user.addresses
    })
  } catch (error) {
    console.error("Add address error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// PUT /api/v1/user/addresses/:addressId
module.exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const { name, phone, address, city, isDefault } = req.body

    const user = await User.findById(req.user._id)
    const targetAddress = user.addresses.id(addressId)

    if (!targetAddress) {
      return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ." })
    }

    if (name) targetAddress.name = name
    if (phone) targetAddress.phone = phone
    if (address) targetAddress.address = address
    if (city) targetAddress.city = city

    if (isDefault !== undefined) {
      if (isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false)
        targetAddress.isDefault = true
      } else {
        // If user wants to unset default, but it's the only address, keep it default
        if (targetAddress.isDefault && user.addresses.length > 1) {
          targetAddress.isDefault = false
          // Set the first other address as default
          const other = user.addresses.find(addr => addr._id.toString() !== addressId)
          if (other) other.isDefault = true
        }
      }
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: "Cập nhật địa chỉ thành công!",
      data: user.addresses
    })
  } catch (error) {
    console.error("Update address error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// DELETE /api/v1/user/addresses/:addressId
module.exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const user = await User.findById(req.user._id)

    const targetAddress = user.addresses.id(addressId)
    if (!targetAddress) {
      return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ." })
    }

    const wasDefault = targetAddress.isDefault
    user.addresses.pull({ _id: addressId })

    // If we deleted the default address, set another one as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: "Xoá địa chỉ thành công!",
      data: user.addresses
    })
  } catch (error) {
    console.error("Delete address error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// PATCH /api/v1/user/addresses/:addressId/default
module.exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const user = await User.findById(req.user._id)

    const targetAddress = user.addresses.id(addressId)
    if (!targetAddress) {
      return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ." })
    }

    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId
    })

    await user.save()

    return res.status(200).json({
      success: true,
      message: "Đặt địa chỉ mặc định thành công!",
      data: user.addresses
    })
  } catch (error) {
    console.error("Set default address error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/user/forgot-password
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp email." })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản với email này." })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiration

    user.otp = otp
    user.otpExpires = otpExpires
    await user.save()

    // Send email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #6C3D2F; text-align: center;">Mã xác thực khôi phục mật khẩu</h2>
        <p>Chào bạn,</p>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại Komorebi Manga Store. Dưới đây là mã xác thực OTP của bạn:</p>
        <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #6C3D2F; border-radius: 4px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 13px;">Mã xác thực này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Komorebi Manga Store &copy; 2026</p>
      </div>
    `

    const mailRes = await sendEmail({
      to: email,
      subject: "Komorebi Manga Store - Khôi phục mật khẩu",
      html: emailHtml
    })

    if (!mailRes.success) {
      return res.status(500).json({ success: false, message: "Không thể gửi email OTP. Vui lòng thử lại sau." })
    }

    return res.status(200).json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}

// POST /api/v1/user/reset-password
module.exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ email, mã OTP và mật khẩu mới." })
    }

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản." })
    }

    // Check OTP validity
    if (!user.otp || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Mã OTP không đúng hoặc đã hết hạn." })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    
    // Clear OTP fields
    user.otp = null
    user.otpExpires = null
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới."
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." })
  }
}