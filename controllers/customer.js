const path = require( 'path' );
const sharp = require( 'sharp' );
const helperBcrypt = require( '../helper/helperBcrypt' );
const helperJwt = require( '../helper/helperJwt' );
const helperEmail = require( '../helper/helperEmail' );
const {
	isEmailValid
} = require( '../helper/helperValidEmail' );

const randomBytes = require( 'randombytes' );
const customerModel = require( '../models' ).Customer;

class CustomerController {
	static register( req, res ) {
		const {
			nama,
			email,
			password
		} = req.body;

		customerModel.create( {
				nama: nama,
				email: email,
				password: password,
				foto: req.file.filename,
				status: false,
				confirmation_code: null,
				reset_token: null,
				expire_token: null
			} )
			.then( customer => {
				res.status( 200 ).send( {
					status: 'OK',
					data: customer,
					error: null
				} )
			} )
			.catch( error => res.status( 500 ).send( error ) );
	}

	static login( req, res ) {
		const {
			email,
			password
		} = req.body;
		let validationError = [];

		if ( !email || !password ) {
			validationError.push( 'Field harus diisi' );
		}

		customerModel.findOne( {
				where: {
					email: email
				}
			} )
			.then( customer => {
				if ( customer ) {
					console.log( 'masuk' );
					if ( customer.status == false ) {
						validationError.push( 'anda belum verifikasi email' );
						console.log( validationError );
					} else {
						helperBcrypt.bandingkanPassword( password, customer.password, ( err, hasil ) => {
							if ( hasil ) {
								console.log( 'cocok' );
							} else {
								validationError.push( 'password salah' );
								// console.log( validationError );
							}
						} );
					}
				} else {
					validationError.push( 'Email belum terdaftar' )
					// console.log( validationError );
				}
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}
}

module.exports = CustomerController;