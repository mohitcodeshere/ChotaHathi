const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getPendingOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
