const helperBcrypt = require( '../helper/helperBcrypt' );
const helperJwt = require( '../helper/helperJwt' );
const helperEmail = require( '../helper/helperEmail' );
const helperValidEmail = require( '../helper/helperValidEmail' );
const customerModel = require( '../models' ).Customer;
const bcrypt = require( 'bcrypt' );
const Sequelize = require( 'sequelize' );
const Op = Sequelize.Op;

class CustomerController {
	static async register( req, res ) {
		const {
			nama,
			email,
			password
		} = req.body;

		let errors = {};
		let response = {};
		let statusCode;

		if ( !nama ) {
			errors.nama = "field nama harus diisi";
		}
		if ( !email ) {
			errors.email = "field email harus diisi";
		} else if ( helperValidEmail.isEmailValid( email ) == false ) {
			errors.email = "format email tidak valid";
		} else {
			const emailExist = await customerModel.findOne( {
				where: {
					email: email
				}
			} );
			if ( emailExist ) {
				errors.email = "email sudah terdaftar";
			}
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

		try {
			let token;
			let payload = {};
			payload.email = email;
			helperJwt.buatToken( payload, ( hasil ) => {
				token = hasil;
			} );
			helperBcrypt.buatPassword( password, async ( err, passwordHash ) => {
				if ( Object.entries( errors ).length == 0 ) {
					const customer = await customerModel.create( {
						nama: nama,
						email: email,
						password: passwordHash,
						foto: filename,
						status: false,
						confirmation_code: token,
						reset_token: null,
						expire_token: null
					} );
					statusCode = 200;
					response.status = 'success';
					response.data = customer;
					response.error = errors;
					helperEmail.sendEmailVerification( customer.email, customer.confirmation_code );
				} else {
					statusCode = 400;
					response.status = 'client error';
					response.data = null;
					response.error = errors;
				}
				res.status( statusCode ).send( response );
			} );
		} catch ( e ) {
			res.status( 500 ).send( "server error" );
			console.log( e.message );
		}
	}

	static async login( req, res ) {
		const {
			email,
			password
		} = req.body;

		let errors = {};
		let response = {};
		let statusCode;
		let token;

		try {
			const customer = await customerModel.findOne( {
				where: {
					email: email
				}
			} );

			if ( !email ) {
				errors.email = "field email harus diisi";
			} else if ( helperValidEmail.isEmailValid( email ) == false ) {
				errors.email = "format email tidak valid";
			} else if ( !customer ) {
				errors.email = "email belum terdaftar";
			} else if ( customer.status == false ) {
				errors.email = "anda belum verifikasi email";
			} else if ( !password ) {
				errors.password = "field password harus diisi";
			} else {
				const match = await bcrypt.compare( password, customer.password );
				if ( !match ) {
					errors.password = "password salah";
				} else {
					let payload = {};
					payload.id = customer.id;
					payload.email = customer.email;
					helperJwt.buatToken( payload, ( hasil ) => {
						token = hasil;
					} );
				}
			}

			if ( Object.entries( errors ).length == 0 ) {
				statusCode = 200;
				response.status = 'success';
				response.data = {
					token: token
				};
				response.error = errors;
			} else {
				statusCode = 400;
				response.status = 'client error';
				response.data = null;
				response.error = errors;
			}

			res.status( statusCode ).send( response );
		} catch ( e ) {
			res.status( 500 ).send( "server error" );
			console.log( e.message );
		}
	}

	static async getAllCustomers( req, res ) {
		try {
			const data = await customerModel.findAll();
			let result;
			if ( data.length > 0 ) {
				result = data;
			} else {
				result = "belum ada data";
			}
			const response = {
				status: 'success',
				data: result,
				error: null
			}
			res.status( 200 ).send( response );
		} catch ( e ) {
			res.status( 500 ).send( "server error" );
			console.log( e.message );
		}
	}

	static async getProfile( req, res ) {
		const {
			token
		} = req.headers;

		let errors = {};
		let response = {};
		let statusCode;
		let email;

		try {
			if ( !token ) {
				errors.token = "token tidak ada";
			} else {
				helperJwt.cekToken( token, ( err, decoded ) => {
					if ( err ) {
						errors.token = "invalid token";
					} else {
						email = decoded.email;
					}
				} );
			}

			let customer = {}
			if ( email ) {
				customer = await customerModel.findOne( {
					where: {
						email: email
					}
				} );
				if ( !customer ) {
					errors.akun = "akun anda belum terdaftar di aplikasi";
				} else {
					customer = customer;
				}
			}

			if ( Object.entries( errors ).length == 0 ) {
				statusCode = 200;
				response.status = 'success';
				response.data = customer;
				response.error = errors;
			} else {
				statusCode = 400;
				response.status = 'client error';
				response.data = null;
				response.error = errors;
			}

			res.status( statusCode ).send( response );
		} catch ( e ) {
			res.status( 500 ).send( "server error" );
			console.log( e.message );
		}
	}

	static async verifikasi( req, res ) {
		const {
			confirmation_code
		} = req.params;

		let errors = {};
		let response = {};
		let statusCode;
		let email;
		try {
			const customer = await customerModel.findOne( {
				where: {
					confirmation_code: confirmation_code
				}
			} );

			if ( !customer ) {
				errors.confirmation_code = "kode verifikasi tidak valid";
			} else {
				await customer.update( {
					status: true
				} );
			}

			if ( Object.entries( errors ).length == 0 ) {
				statusCode = 200;
				response.status = 'success';
				response.data = {
					"status_akun": "sudah melakukan verifikasi"
				};
				response.error = errors;
			} else {
				statusCode = 400;
				response.status = 'client error';
				response.data = null;
				response.error = errors;
			}

			res.status( statusCode ).send( response );
		} catch ( e ) {
			res.status( 500 ).send( {
				status: 'server error',
				data: null,
				error: e.message
			} )
		}
	}

	static async lupaPassword( req, res ) {
		const {
			email
		} = req.body;

		let errors = {};
		let response = {};
		let statusCode;

		try {
			if ( !email ) {
				errors.email = "masukkan email anda";
			} else {
				const customer = await customerModel.findOne( {
					where: {
						email: email
					}
				} );

				if ( !customer ) {
					errors.email = "email belum terdaftar";
				} else {
					let tokenReset;
					let payload = {};
					payload.email = email;
					helperJwt.buatToken( payload, ( hasil ) => {
						tokenReset = hasil;
					} );

					await customer.update( {
						reset_token: tokenReset,
						expire_token: Date.now() + 3600000
					} );
				}
			}

			if ( Object.entries( errors ).length == 0 ) {
				statusCode = 200;
				response.status = 'success';
				response.data = {
					pesan: "cek email untuk pengaturan ulang password"
				};
				response.error = errors;
			} else {
				statusCode = 400;
				response.status = 'client error';
				response.data = null;
				response.error = errors;
			}

			res.status( statusCode ).send( response );
		} catch ( e ) {
			res.status( 500 ).send( {
				status: 'server error',
				data: null,
				error: e.message
			} )
		}
	}

	static async resetPassword( req, res ) {
		const {
			password
		} = req.body;
		const {
			token
		} = req.params;

		let errors = {};
		let response = {};
		let statusCode;

		try {
			const customer = await customerModel.findOne( {
				where: {
					reset_token: token
				}
			} );

			if ( !password ) {
				errors.password = "field password harus diisi";
			} else if ( password.length < 4 ) {
				errors.password = "password minimal 4 karakter";
			}
			helperBcrypt.buatPassword( password, async ( err, passwordHash ) => {
				if ( Object.entries( errors ).length == 0 ) {
					await customer.update( {
						password: passwordHash,
						reset_token: null,
						expire_token: null
					} );

					statusCode = 200;
					response.status = 'success';
					response.data = "password telah direset";
					response.error = errors;
				} else {
					statusCode = 400;
					response.status = 'client error';
					response.data = null;
					response.error = errors;
				}

				res.status( statusCode ).send( response );
			} )
		} catch ( e ) {
			res.status( 500 ).send( {
				status: 'server error',
				data: null,
				error: e.message
			} )
		}
	}

	static async search( req, res ) {
		const {
			nama
		} = req.query;

		let errors = {};
		let response = {};
		let statusCode;

		try {
			if ( !nama ) {
				errors.nama = "masukkan nama customer";
			} else {
				const customer = await customerModel.findAll( {
					where: {
						nama: {
							[ Op.like ]: '%' + nama + '%'
						}
					}
				} );

				let rows;
				if ( customer.length > 0 ) {
					rows = customer;
				} else {
					errors.nama = "data tidak ditemukan"
				}

				if ( Object.entries( errors ).length == 0 ) {
					statusCode = 200;
					response.status = 'success';
					response.data = rows;
					response.error = errors;
				} else {
					statusCode = 400;
					response.status = 'client error';
					response.data = null;
					response.error = errors;
				}
			}

			res.status( statusCode ).send( response );
		} catch ( e ) {
			res.status( 500 ).send( "server error" );
			console.log( e.message );
		}
	}

	static async delete( req, res ) {
		const {
			id
		} = req.params;

		let errors = {};
		let response = {};
		let statusCode;

		try {
			const customer = await customerModel.destroy( {
				where: {
					id: id
				}
			} );

			let rows;
			if ( customer ) {
				rows = "data berhasil dihapus";
			} else {
				errors.rows = "data tidak ada";
			}

			if ( Object.entries( errors ).length == 0 ) {
				statusCode = 200;
				response.status = 'success';
				response.data = rows;
				response.error = errors;
			} else {
				statusCode = 400;
				response.status = 'client error';
				response.data = null;
				response.error = errors;
			}

			res.status( statusCode ).send( response );
		} catch ( e ) {
			res.status( 500 ).send( "server error" );
			console.log( e.message );
		}
	}
}

module.exports = CustomerController;