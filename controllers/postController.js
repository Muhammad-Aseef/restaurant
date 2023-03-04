const Post = require("../models/postModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find().populate([
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
    results: posts.length,
    data: posts,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate([
    {
      path: "user",
      select: "name email",
    },
    {
      path: "likes",
      select: "name email",
    },
  ]);

  if (!post) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: post,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  const newPost = await Post.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      post: newPost,
    },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOneAndUpdate(
    {
      $and: [{ _id: req.params.id }, { user: req.user.id }],
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!post) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "updated successfully",
    data: post,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOneAndDelete({
    $and: [{ _id: req.params.id }, { user: req.user.id }],
  });
  // const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    return next(new AppError("no data found!", 404));
  }
  res.status(200).json({
    status: "deleted successfully",
    data: null,
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const postId = req.query.id;

  if (!postId) {
    return next(new AppError("invalid request", 400));
  }

  const post = await Post.findById(postId).populate({
    path: "user",
    select: "name email",
  });

  if (!post) {
    return next(new AppError("no data found!", 404));
  }
  // checking post's user blocklist
  const postUser = await User.findById(post.user.id);
  if (postUser.blockList.includes(req.user.id)) {
    return next(new AppError("not allowed", 400));
  }

  if (!post.likes.includes(req.user.id)) {
    // like
    post.likes.push(req.user.id);
  } else {
    // unlike
    const index = post.likes.indexOf(req.user.id);
    post.likes.splice(index, 1);
  }
  await post.save();

  res.status(200).json({
    status: "success",
    data: post,
  });
});

exports.userPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ user: req.params.id }).populate([
    {
      path: "likes",
      select: "name email",
    },
  ]);

  res.status(200).json({
    status: "success",
    total: posts.length,
    data: posts,
  });
});

exports.addToFav = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const postId = req.body.post;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("no data found!", 404));
  }

  if (!currentUser.favPosts.includes(postId)) {
    // add
    currentUser.favPosts.push(postId);
  } else {
    // remove
    const index = currentUser.favPosts.indexOf(postId);
    currentUser.favPosts.splice(index, 1);
  }
  await currentUser.save();

  res.status(200).json({
    status: "success",
    data: currentUser,
  });
});
