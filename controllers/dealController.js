const Deal = require("../models/dealModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllDeals = catchAsync(async (req, res, next) => {
  const deals = await Deal.find();

  res.status(200).json({
    status: "success",
    results: deals.length,
    data: deals,
  });
});

exports.getDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: deal,
  });
});

exports.createDeal = catchAsync(async (req, res, next) => {
  const newDeal = await Deal.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      deal: newDeal,
    },
  });
});

exports.updateDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!deal) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "updated successfully",
    data: deal,
  });
});

exports.deleteDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findByIdAndDelete(req.params.id);

  if (!deal) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "deleted successfully",
    data: null,
  });
});
