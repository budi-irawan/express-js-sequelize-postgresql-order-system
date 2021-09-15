const express = require( 'express' );
const router = express.Router();

const customerRoute = require( './customer/customerRoute' );

router.use( '/d-inv/customer', customerRoute );

module.exports = router;