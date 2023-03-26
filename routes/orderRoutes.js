const router = require("express").Router();

const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, orderController.getAllOrders)
  .post(orderController.createOrder);

router.route("/bystatus").get(authController.protect, orderController.byStatus);
router.route("/cancel").patch(orderController.cancelOrder);
router.route("/changeStatus").patch(authController.protect, orderController.changeStatus);

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(authController.protect, orderController.updateOrder)
  .delete(authController.protect, orderController.deleteOrder);

module.exports = router;
