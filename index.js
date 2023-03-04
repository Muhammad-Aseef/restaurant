const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const DB = process.env.DB_LINK;
mongoose.set("strictQuery", false);
// useCreateIndex: true, useFindAndModify: false
mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => {
    console.log("database connected successfully!");
  })
  .catch((err) => {
    console.log("error", err);
  });

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const commentRouter = require("./routes/commentRoutes");

const app = express();

app.use(helmet());

app.use(express.json());
app.use(morgan("dev"));

// limited request with same ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
});

app.use("/api", limiter);

// for noSQL injection
app.use(mongoSanitize());

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);

app.all("*", (req, res, next) => {
  console.log(req);
  // res.status(404).json({
  //   status: "failed",
  //   message: `canno't find the ${req.originalUrl} on this server.`,
  // });
  next(
    new AppError(`canno't find the ${req.originalUrl} on this server.`, 404)
  );
});

app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
