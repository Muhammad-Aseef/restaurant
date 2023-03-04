const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "menu must have name"],
    },
    price: {
      type: Number,
      required: [true, "menu must have price"],
    },
  },
  { timestamps: true }
);

menuSchema.pre("save", function () {
  this.likesCount = this.likes.length;
});

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;
