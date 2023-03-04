const AppError = require("../utils/appError");

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicationError = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate value for ${value}`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const value = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${value.join(". ")}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => {
  return new AppError("Invalid token! Please try to login again", 401);
};

const handleTokenExpiredError = () => {
  return new AppError("Session expired! Please login again.", 401);
};

const sendResponse = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "CastError") {
    err = handleCastError(err);
  } else if (err.code === 11000) {
    err = handleDuplicationError(err);
  } else if (err.name === "ValidationError") {
    err = handleValidationError(err);
  } else if (err.name === "JsonWebTokenError") {
    err = handleJsonWebTokenError();
  } else if (err.name === "TokenExpiredError") {
    err = handleTokenExpiredError();
  }
  sendResponse(err, res);

  // console.log(err);
  // res.status(err.statusCode).json({
  //   status: err.status,
  //   message: err,
  // });
};
