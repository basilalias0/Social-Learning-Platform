const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../Models/paymentController');
const { protect } = require('../Middlewares/authMiddleware');
const bodyParser = require('body-parser');

paymentRouter.post('/create-payment-intent', protect, paymentController.createPaymentIntent);
paymentRouter.post('/webhook', bodyParser.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

module.exports = paymentRouter;