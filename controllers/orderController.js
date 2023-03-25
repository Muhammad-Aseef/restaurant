const Order = require("../models/orderModel");
const Deal = require("../models/dealModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;

  const newOrder = await Order.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      order: newOrder,
    },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!order) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: null,
  });
});
