const bcrypt = require( 'bcrypt' );

class HelperBcrypt {
	static buatPassword( password, cb ) {
		bcrypt.hash( password, 10, ( err, hashPasword ) => {
			if ( err ) {
				cb( err, null )
			} else {
				cb( null, hashPasword )
			}
		} )
	}

	static bandingkanPassword( password, hashPasword, cb ) {
		bcrypt.compare( password, hashPasword, ( err, result ) => {
			if ( err ) {
				cb( err, null )
			} else {
				cb( null, result )
			}
		} )
	}
}

module.exports = HelperBcrypt;