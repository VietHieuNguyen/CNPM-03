require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../model/User")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL)
    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Seeding admin account 1
    const adminEmail = "admin@komorebi.com"
    const existAdmin = await User.findOne({ email: adminEmail })
    if (!existAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 12)
      await User.create({
        name: "Komorebi Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
      })
      console.log("Admin account seeded: admin@komorebi.com / admin123")
    }

    // Seeding admin account 2
    const admin2Email = "admin2@komorebi.com"
    const existAdmin2 = await User.findOne({ email: admin2Email })
    if (!existAdmin2) {
      const hashedPassword = await bcrypt.hash("admin123", 12)
      await User.create({
        name: "Komorebi Admin 2",
        email: admin2Email,
        password: hashedPassword,
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
      })
      console.log("Secondary Admin account seeded: admin2@komorebi.com / admin123")
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = connectDB