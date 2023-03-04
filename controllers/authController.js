const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_KEY, { expiresIn: "90d" });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = createToken(newUser._id);
  // newUser.password = null;
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Invalid email or password!", 401));
  }

  const token = createToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // console.log(token);
  if (!token) {
    return next(new AppError("Your are not logged in!", 401));
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY);
  // console.log(decoded);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User no longer exist!", 401));
  }

  // check is password has been changed after token was generated
  req.user = currentUser;
  next();
});

exports.changePassword = catchAsync(async (req, res, next) => {
  // const user = await User.findById(req.user._id).select("+password");
  const user = req.user;
  user = user.select("+password");
  const { currentPassword, newPassword } = req.body;

  if (!(await user.comparePassword(currentPassword, user.password))) {
    return next(new AppError("Invalid password!", 401));
  }

  user.password = newPassword;
  await user.save();

  const token = createToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});
