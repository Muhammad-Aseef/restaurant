const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order: [
      {
        menuId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "Menu",
          // required: true,
        },
        quantity: {
          type: Number,
          // required: true,
          default: 1,
        },
      },
    ],
    deals: [
      {
        dealId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "Deal",
          // required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    address: {
      type: String,
      required: [true, "order must have image"],
    },
    email: {
      type: String,
      required: [true, "order must have email address"],
      lowercase: true,
    },
    contact: {
      type: Number,
      required: [true, "order must have contact"],
    },
    total: {
      type: Number,
      default: 60,
      min: 60,
    },
    status: {
      type: String,
      enum: ["placed", "onway", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

// orderSchema.pre("save", function () {

// });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
