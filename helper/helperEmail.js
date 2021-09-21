const nodemailer = require( 'nodemailer' );
require( 'dotenv' ).config();

const transporter = nodemailer.createTransport( {
	service: 'gmail',
	auth: {
		user: process.env.MAIL,
		pass: process.env.PASS,
	}
} );

const sendEmailVerification = ( email, confirmationCode ) => {
	const options = {
		from: "'Server-Q' <no-reply@gmail.com>",
		to: email,
		subject: "Verifikasi Pendaftaran",
		text: "Sukses",
		html: `<h3>Selamat datang</h3><br/>
		Klik link ini untuk verifikasi pendaftaran. <a href=http://localhost:3000/d-inv/customer/verifikasi/${confirmationCode}><b> Verifikasi </b></a>`,
	};

	transporter.sendMail( options, ( err, info ) => {
		if ( err ) {
			console.log( err );
			console.log( err.message, '=========>>>' );
		}
		console.log( `Email terkirim ke ${email}` );
	} );
};

module.exports = {
	transporter,
	sendEmailVerification
}