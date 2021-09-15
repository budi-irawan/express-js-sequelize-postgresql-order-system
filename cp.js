function CheckPassword( inputtxt ) {
	var decimal = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
	if ( inputtxt.value.match( decimal ) ) {
		console.log( 'Correct, try another...' );
	} else {
		console.log( 'Wrong...!' );
	}
}
CheckPassword( 'abcA' )