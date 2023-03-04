const router = require("express").Router();

const commentController = require("../controllers/commentController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(commentController.getAllComments)
  .post(authController.protect, commentController.createComment);

router
  .route("/like")
  .patch(authController.protect, commentController.likeComment);

router.route("/post/:id").get(commentController.postComments);

router
  .route("/:id")
  .get(commentController.getComment)
  .patch(authController.protect, commentController.updateComment)
  .delete(authController.protect, commentController.deleteComment);

module.exports = router;
