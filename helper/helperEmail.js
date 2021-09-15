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
		from: "'Server-AMQ' <no-reply@gmail.com>",
		to: email,
		subject: "Verifikasi Pendaftaran",
		text: "Sukses",
		html: `<h3>Selamat datang</h3><br/>
		Aktivasi akun anda di sini <a href=http://localhost:3000/d-inv/customer/aktivasi/${confirmationCode}> aktivasi</a>`,
	};

	transporter.sendMail( options, ( err, info ) => {
		if ( err ) {
			console.log( err );
		}
		console.log( `Email terkirim ke ${email}` );
	} );
};

module.exports = {
	transporter,
	sendEmailVerification
}