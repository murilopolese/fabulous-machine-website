require('dotenv').config()
var express = require( 'express' );
var bodyParser = require( 'body-parser' );
var mongoose = require( 'mongoose' );

// CONNECT TO DATABASE
mongoose.connect( process.env.MONGO_URI || 'mongodb://172.17.0.2:27017/fabulous-machines' );
// DEFINE SCHEMA
var Schema = new mongoose.Schema({
	surprise: Boolean,
	title: String,
	author: String,
	rawPoints: Array,
	points: Array,
	createdAt: Date
})
// DEFINE MODEL
var Drawing = mongoose.model( 'Drawing', Schema )


// START AND CONFIGURE EXPRESS APP
var app = express();
app.use( express.static( __dirname + '/app' ) );
app.use( bodyParser.json( { limit: '50mb', parameterLimit: 100000 } ) );
app.use( bodyParser.urlencoded( { limit: '50mb', extended: true, parameterLimit: 100000 } ) );


// CUSTOM ROUTES
// app.get( '*', function( req, res ) {
//     res.redirect( '/' );
// });
// REST ROUTES
var REST = require( 'express-restify' )( app );
REST.register({
	url: '/drawings',
	model: 'Drawing'
});

app.listen( process.env.PORT || 3000, function() {
	console.log( 'Listening to port', process.env.PORT || 3000 );
});
