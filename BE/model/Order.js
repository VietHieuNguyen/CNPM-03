const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
  comic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comic",
    required: true,
  },
  title: String,
  image: String,
  price: Number,
  quantity: { type: Number, default: 1 },
})

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    cancelRequest: {
      type: Boolean,
      default: false,
    },
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Order", orderSchema)
