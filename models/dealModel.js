const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "deal must have name"],
    },
    price: {
      type: Number,
      required: [true, "deal must have price"],
    },
    items: [
      {
        menuId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "Menu",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

const Menu = mongoose.model("Menu", dealSchema);

module.exports = Menu;
