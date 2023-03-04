const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find().populate([
    {
      path: "followers",
      select: "name email",
    },
    {
      path: "followings",
      select: "name email",
    },
  ]);

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate([
    {
      path: "followers",
      select: "name email",
    },
    {
      path: "followings",
      select: "name email",
    },
    {
      path: "blockList",
      select: "name email",
    },
  ]);

  if (!user) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});

// update by admin
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "updated successfully",
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "deleted successfully",
    data: null,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const allowed = ["name", "email"];
  let filterBody = {};
  Object.keys(req.body).forEach((el) => {
    if (allowed.includes(el)) filterBody[el] = req.body[el];
  });
  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "updated successfully",
    data: user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: "deleted successfully",
    data: null,
  });
});

exports.followUser = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  // prevent from following yourself
  if (req.query.id && currentUser.id !== req.query.id) {
    const user = await User.findById(req.query.id);

    if (!user) {
      return next(new AppError("no user found!", 404));
    }
    if (currentUser.followings.includes(user.id)) {
      // unfollow
      const index = currentUser.followings.indexOf(user.id);
      currentUser.followings.splice(index, 1);

      const index2 = user.followers.indexOf(currentUser.id);
      user.followers.splice(index2, 1);
    } else {
      // follow
      currentUser.followings.push(user.id);
      user.followers.push(currentUser.id);
    }

    await currentUser.save();
    await user.save();

    res.status(200).json({
      status: "success",
      data: currentUser,
    });
  } else return next(new AppError("Invalid request.", 400));
});

exports.blockUser = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  if (req.query.id && currentUser.id !== req.query.id) {
    const user = await User.findById(req.query.id);

    if (!user) {
      return next(new AppError("no user found!", 404));
    }
    if (currentUser.blockList.includes(user.id)) {
      // unblock
      const index = currentUser.blockList.indexOf(user.id);
      currentUser.blockList.splice(index, 1);
    } else {
      // block
      currentUser.blockList.push(user.id);
      // removing both users from their followings and followers list
      currentUser.followers = currentUser.followers.filter(
        (el) => el != user.id
      );
      currentUser.followings = currentUser.followings.filter(
        (el) => el != user.id
      );
      user.followers = user.followers.filter((el) => el != currentUser.id);
      user.followings = user.followings.filter((el) => el != currentUser.id);
    }

    await currentUser.save();
    await user.save();

    res.status(200).json({
      status: "success",
      data: currentUser,
    });
  } else return next(new AppError("Invalid request...", 400));
});
