const helperBcrypt = require( '../helper/helperBcrypt' );
const helperJwt = require( '../helper/helperJwt' );
const helperValidEmail = require( '../helper/helperValidEmail' );
const customerModel = require( '../models' ).Customer;

class CustomerController {
	static async register( req, res ) {
		const {
			nama,
			email,
			password
		} = req.body;

		let errors = {};

		if ( !nama ) {
			errors.nama = "field nama harus diisi";
		}

		const emailExist = await customerModel.findOne( {
			where: {
				email: email
			}
		} );

		if ( !email ) {
			errors.email = "field email harus diisi";
		} else if ( helperValidEmail.isEmailValid( email ) == false ) {
			errors.email = "format email tidak valid";
		} else if ( emailExist ) {
			errors.email = "email sudah terdaftar";
		}

		if ( !password ) {
			errors.password = "field password harus diisi";
		} else if ( password.length < 4 ) {
			errors.password = "password minimal 4 karakter";
		}

		let filename;
		if ( !req.file ) {
			errors.foto = "foto belum diupload";
		} else {
			filename = req.file.filename;
		}

		let response = {};
		let statusCode;

		if ( Object.entries( errors ).length == 0 ) {
			const customer = await customerModel.create( {
				nama: nama,
				email: email,
				password: password,
				foto: filename,
				status: false,
				confirmation_code: null,
				reset_token: null,
				expire_token: null
			} );
			statusCode = 200;
			response.status = 'success';
			response.data = {
				nama: customer.nama,
				email: customer.email,
				foto: customer.foto,
			}
			response.error = errors;
		} else {
			statusCode = 400;
			response.status = 'client error';
			response.data = null;
			response.error = errors;
		}

		res.status( statusCode ).send( response );
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