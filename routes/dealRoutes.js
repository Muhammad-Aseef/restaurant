const router = require("express").Router();

const dealController = require("../controllers/dealController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(dealController.getAllDeals)
  .post(authController.protect, dealController.createDeal);

router.route("/changeStatus/:id").patch(authController.protect, dealController.changeStatus);

router
  .route("/:id")
  .get(dealController.getDeal)
  .patch(authController.protect, dealController.updateDeal)
  .delete(authController.protect, dealController.deleteDeal);

module.exports = router;
