const router = require("express").Router();

const menuController = require("../controllers/menuController");
const authController = require("../controllers/authController");

// router.param("id", menuController.checkID);

router
  .route("/")
  .get(menuController.getAllMenus)
  .post(authController.protect, menuController.createMenu); //

router
  .route("/changeStatus/:id")
  .patch(authController.protect, menuController.changeStatus);

router
  .route("/:id")
  .get(menuController.getMenu)
  .patch(authController.protect, menuController.updateMenu)
  .delete(authController.protect, menuController.deleteMenu);

module.exports = router;
