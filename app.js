const express = require( 'express' );
const path = require( 'path' );

const app = express();
const port = 3000;

app.use( express.json( {
	limit: 1024 * 1024 * 20
} ) );
app.use( express.urlencoded( {
	extended: false,
	limit: '50mb'
} ) );

const router = require( './router/index' );
app.use( '/', router );

app.listen( port, () => console.log( `http://localhost:3000` ) )

module.exports = app;