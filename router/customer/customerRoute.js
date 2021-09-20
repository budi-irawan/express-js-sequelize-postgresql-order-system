const express = require( 'express' );
const router = express.Router();
const {
	upload,
	storage
} = require( '../../middleware/upload' );

const customerController = require( '../../controllers/customer' );

router.post( '/register', upload.single( 'foto' ), customerController.register );
router.post( '/login', customerController.login );
router.get( '/profile', customerController.getProfile );
router.get( '/', customerController.getAllCustomers );
router.put( '/verifikasi/:confirmation_code', customerController.verifikasi );
router.post( '/lupa-password', customerController.lupaPassword );
router.put( '/reset-password/:token', customerController.resetPassword );

module.exports = router;