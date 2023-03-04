const router = require("express").Router();

const postController = require("../controllers/postController");
const authController = require("../controllers/authController");

// router.param("id", postController.checkID);

router
  .route("/")
  .get(postController.getAllPosts)
  .post(authController.protect, postController.createPost);

router.route("/like").patch(authController.protect, postController.likePost);
router.route("/fav").post(authController.protect, postController.addToFav);
router.route("/user/:id").get(postController.userPosts);

router
  .route("/:id")
  .get(postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

module.exports = router;
