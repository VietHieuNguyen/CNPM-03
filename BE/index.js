const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/database")
const { globalLimiter } = require("./middlewares/rateLimit.middleware")

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors({
  origin: process.env.ORIGINAL_URL || "http://localhost:5173",
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use("/api", globalLimiter)

// Routes
const clientRoutes = require("./routes/client/index.routes")
const adminRoutes = require("./routes/admin/index.admin.routes")

clientRoutes(app)
adminRoutes(app)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Manga Store API is running!", version: "v1" })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("=== GLOBAL ERROR ===");
  console.error(err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi tải file hoặc hệ thống xảy ra.",
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route không tồn tại." })
})

connectDB()

app.listen(PORT, "0.0.0.0", () => {
  console.log(`App is listening on port: ${PORT}`)
  console.log(`Manga Store API: http://localhost:${PORT}/api/health`)
})