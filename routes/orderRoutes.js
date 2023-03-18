const router = require("express").Router();

const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

router
  .route("/:id")
  .get(orderController.getorder)
  .patch(authController.protect, orderController.updateOrder)
  .delete(authController.protect, orderController.deleteOrder);

module.exports = router;
