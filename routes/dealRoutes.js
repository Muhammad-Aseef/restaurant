const router = require("express").Router();

const dealController = require("../controllers/dealController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(dealController.getAllDeals)
  .post(dealController.createDeal); //authController.protect,

router
  .route("/:id")
  .get(dealController.getDeal)
  .patch(dealController.updateDeal) //authController.protect,
  .delete(dealController.deleteDeal); //authController.protect,

module.exports = router;
