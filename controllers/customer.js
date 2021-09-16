const helperBcrypt = require( '../helper/helperBcrypt' );
const helperJwt = require( '../helper/helperJwt' );
const customerModel = require( '../models' ).Customer;

class CustomerController {
	static register( req, res ) {
		const {
			nama,
			email,
			password
		} = req.body;

		customerModel.findOne( {
				where: {
					email: email
				}
			} )
			.then( customer => {
				if ( customer ) {
					res.status( 400 ).send( {
						status: 'ERROR',
						data: null,
						error: 'email sudah terdaftar'
					} )
				} else {
					helperBcrypt.buatPassword( password, ( err, passwordHash ) => {
						customerModel.create( {
								nama: nama,
								email: email,
								password: passwordHash,
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
							.catch( error => res.status( 500 ).send( error ) )
					} )
				}
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}

	static login( req, res ) {
		const {
			email,
			password
		} = req.body;

		customerModel.findOne( {
				where: {
					email: email
				}
			} )
			.then( customer => {
				if ( customer ) {
					if ( customer.status == false ) {
						res.status( 400 ).send( {
							status: 'ERROR',
							data: null,
							error: 'anda belum verifikasi email'
						} )
					} else {
						helperBcrypt.bandingkanPassword( password, customer.password, ( err, data ) => {
							if ( data ) {
								let payload = {};
								payload.id = customer.id;
								payload.email = customer.email;

								helperJwt.buatToken( payload, ( token ) => {
									res.status( 200 ).send( {
										status: 'SUCCESS',
										data: {
											token: token
										},
										error: null
									} )
								} )
							} else {
								res.status( 400 ).send( {
									status: 'ERROR',
									data: null,
									error: 'password salah'
								} )
							}
						} )
					}
				} else {
					res.status( 400 ).send( {
						status: 'ERROR',
						data: null,
						error: 'email belum terdaftar'
					} )
				}
			} )
			.catch( error => res.status( 500 ).send( error ) )
	}

	static getProfile( req, res ) {
		if ( !req.headers.token ) {
			res.status( 400 ).send( {
				status: 'ERROR',
				data: null,
				error: 'token tidak ada'
			} )
		} else {
			helperJwt.cekToken( req.headers.token, ( err, decoded ) => {
				if ( err ) {
					res.status( 400 ).send( {
						status: 'ERROR',
						data: null,
						error: 'invalid token'
					} )
				} else {
					customerModel.findOne( {
							where: {
								email: decoded.email
							}
						} )
						.then( customer => {
							res.status( 200 ).send( {
								status: 'SUCCESS',
								data: customer,
								error: null
							} )
						} )
						.catch( error => res.status( 500 ).send( error ) )
				}
			} )
		}
	}
}

module.exports = CustomerController;