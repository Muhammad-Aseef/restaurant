const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find().populate({
    path: "user",
    select: "name email",
  });
  res.status(200).json({
    status: "success",
    results: comments.length,
    data: comments,
  });
});

exports.getComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).populate([
    {
      path: "user",
      select: "name email",
    },
    {
      path: "likes",
      select: "name email",
    },
  ]);
  if (!comment) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: comment,
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;

  if (req.body.post) {
    const post = await Post.findById(req.body.post).populate({
      path: "user",
      select: "blockList",
    });
    if (!post) {
      return next(new AppError(`no post found with id ${req.body.post}`, 404));
    }
    if (post.user.blockList.includes(req.user.id)) {
      return next(new AppError("not allowed", 400));
    }
    const newComment = await Comment.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        comment: newComment,
      },
    });
  } else return next(new AppError("Invalid request!!", 404));
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findOneAndUpdate(
    {
      $and: [{ _id: req.params.id }, { user: req.user.id }],
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!comment) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "updated successfully",
    data: comment,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  // const comment = await Comment.findByIdAndDelete(req.params.id);
  const comment = await Comment.findOneAndDelete({
    $and: [{ _id: req.params.id }, { user: req.user.id }],
  });
  if (!comment) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "deleted successfully",
    data: null,
  });
});

exports.likeComment = catchAsync(async (req, res, next) => {
  const commentId = req.query.id;

  if (!commentId) {
    return next(new AppError("invalid request", 400));
  }

  const comment = await Comment.findById(commentId).populate({
    path: "user",
    select: "name email",
  });

  if (!comment) {
    return next(new AppError("no comment found!", 404));
  }
  if (!comment.likes.includes(req.user.id)) {
    // like
    comment.likes.push(req.user.id);
  } else {
    // unlike
    const index = comment.likes.indexOf(req.user.id);
    comment.likes.splice(index, 1);
  }
  await comment.save();

  res.status(200).json({
    status: "success",
    data: comment,
  });
});

exports.postComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({ post: req.params.id }).populate([
    {
      path: "user",
      select: "name email",
    },
    {
      path: "likes",
      select: "name email",
    },
  ]);

  res.status(200).json({
    status: "success",
    total: comments.length,
    data: comments,
  });
});
