const express = require("express");
const router = express.Router();

const { processPayment } = require('../handlers/payments');

router.route('/charge').post(processPayment);

module.exports = router;