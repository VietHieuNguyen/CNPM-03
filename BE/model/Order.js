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
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
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
