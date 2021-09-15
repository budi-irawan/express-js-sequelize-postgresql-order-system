const express = require( 'express' );
const router = express.Router();
const {
	upload,
	storage
} = require( '../../middleware/upload' );

const customerController = require( '../../controllers/customer' );

router.post( '/register', upload.single( 'foto' ), customerController.register );
router.post( '/login', customerController.login );

module.exports = router;