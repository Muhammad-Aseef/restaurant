const fs = require("fs");
const mongoose = require("mongoose");
const Order = require("../models/orderModel");

// db link here
const DB = "";
mongoose.set("strictQuery", false);
// useCreateIndex: true, useFindAndModify: false
mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => {
    console.log("database connected successfully!");
    start();
  })
  .catch((err) => {
    console.log("error", err);
  });

const start = () => {
  //   console.log(process.argv);
  const data = JSON.parse(fs.readFileSync(`${__dirname}/dev-data.json`, "utf-8"));

  if (process.argv[2] == "--import") {
    importData(data);
  } else if (process.argv[2] == "--delete") {
    deleteData();
  }
};

const importData = async (data) => {
  try {
    await Order.create(data);
    console.log("data created");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Order.deleteMany();
    console.log("data deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
