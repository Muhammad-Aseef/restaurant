const Menu = require("../models/menuModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllMenus = catchAsync(async (req, res, next) => {
  const menus = await Menu.find();

  res.status(200).json({
    status: "success",
    results: menus.length,
    data: menus,
  });
});

exports.getMenu = catchAsync(async (req, res, next) => {
  const menu = await Menu.findById(req.params.id);

  if (!menu) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: menu,
  });
});

exports.createMenu = catchAsync(async (req, res, next) => {
  const newMenu = await Menu.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      menu: newMenu,
    },
  });
});

exports.updateMenu = catchAsync(async (req, res, next) => {
  const menu = await Menu.findOneAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      price: req.body.price,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!menu) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: menu,
  });
});

exports.deleteMenu = catchAsync(async (req, res, next) => {
  const menu = await Menu.findByIdAndDelete(req.params.id);

  if (!menu) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.changeStatus = catchAsync(async (req, res, next) => {
  const menu = await Menu.findById(req.params.id);

  if (!menu) {
    return next(new AppError("no data found!", 404));
  }
  if (menu.status == "active") menu.status = "inactive";
  else menu.status = "active";

  await menu.save();

  res.status(200).json({
    status: "success",
    data: menu,
  });
});
