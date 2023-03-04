const router = require("express").Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post(
  "/changePassword",
  authController.protect,
  authController.changePassword
);

router.route("/").get(userController.getAllUser);

router
  .route("/updateMe")
  .patch(authController.protect, userController.updateMe);

router
  .route("/deleteMe")
  .delete(authController.protect, userController.deleteMe);

router.route("/follow").patch(authController.protect, userController.followUser);
router.route("/block").patch(authController.protect, userController.blockUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
