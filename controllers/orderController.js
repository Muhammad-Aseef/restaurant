var moment = require("moment");
const Order = require("../models/orderModel");
const Deal = require("../models/dealModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find().populate([
    { path: "order.menuId", select: "name" },
    { path: "deals.dealId", select: "name" },
  ]);

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)([
    { path: "order.menuId", select: "name" },
    { path: "deals.dealId", select: "name" },
  ]);

  if (!order) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  req.body.status = "placed";
  req.body.rating = 0;
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

exports.byStatus = catchAsync(async (req, res, next) => {
  if (!req.query.status) {
    return next(new AppError("Invalid Request", 400));
  }

  const orders = await Order.find({ status: req.query.status });

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    $and: [{ _id: req.body.orderId }, { email: req.body.email }, { status: "placed" }],
  });

  if (!order) {
    return next(new AppError("no data found!", 404));
  }

  // console.log(
  //   (new Date() - order.createdAt) / 1000 / 60,
  //   Math.floor((new Date() - order.createdAt) / 1000 / 60)
  // );

  if (Math.floor((new Date() - order.createdAt) / 1000 / 60) > 30) {
    return next(new AppError("Time limit exceeded to cancel the order", 400));
  }

  order.status = "cancelled";
  await order.save();

  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.changeStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    $and: [{ _id: req.body.orderId }, { status: { $in: ["placed", "onway"] } }],
  });

  if (!order) {
    return next(new AppError("no data found!", 404));
  }

  if (order.status == "placed") order.status = "onway";
  else order.status = "delivered";

  await order.save();

  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.rating = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    $and: [{ _id: req.body.orderId }, { status: "delivered" }],
  });

  if (!order) {
    return next(new AppError("no data found!", 404));
  }

  order.rating = req.body.rating;

  await order.save();

  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.filter = catchAsync(async (req, res, next) => {
  // const queryObj = { ...req.query };
  // const excludedFields = ["page", "sort"];
  // excludedFields.forEach((el) => delete queryObj[el]);

  let { duration, status } = req.query;

  if (!duration || status == undefined) {
    return next(new AppError("Invalid request", 400));
  }

  const allowedDuration = ["today", "week", "month", "year"];
  const allowedStatus = ["", "placed", "onway", "delivered", "cancelled"]; // status = "" means all

  duration = duration.toLowerCase();
  status = status.toLowerCase();

  // console.log(duration, status);
  if (!allowedDuration.includes(duration) || !allowedStatus.includes(status)) {
    return next(new AppError("Invalid request...", 400));
  }

  let start = new Date(moment().startOf("day"));
  // const end = new Date();
  if (duration == "week") {
    start = new Date(moment().subtract(1, "weeks").startOf("day"));
  } else if (duration == "month") {
    start = new Date(moment().subtract(1, "months").startOf("day"));
  } else if (duration == "year") {
    start = new Date(moment().subtract(1, "years").startOf("day"));
  }
  // console.log(start);
  // console.log(
  //   moment().subtract(1, duration).startOf("day").format("dddd, MMMM Do YYYY, h:mm:ss a")
  // );

  let orders;
  if (status == "") {
    orders = await Order.aggregate([
      {
        $match: { updatedAt: { $gte: start } },
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
          orders: {
            $push: {
              orderId: "$_id",
              price: "$price",
              contact: "$contact",
              email: "$email",
              // createdAt: "$createdAt",
              // updatedAt: "$updatedAt",
            },
          },
        },
      },
      {
        $addFields: { status: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    // orders: { $push: "$$ROOT" }
  } else {
    orders = await Order.aggregate([
      {
        $match: { updatedAt: { $gte: start }, status: status },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          orders: {
            $push: {
              orderId: "$_id",
              price: "$price",
              contact: "$contact",
              email: "$email",
              // createdAt: "$createdAt",
              // updatedAt: "$updatedAt",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
  }

  res.status(200).json({
    status: "success",
    data: orders,
  });
});
