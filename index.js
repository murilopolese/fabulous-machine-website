require('dotenv').config()
var express = require( 'express' );
var bodyParser = require( 'body-parser' );
var mongoose = require( 'mongoose' );
var hbs = require( 'hbs' );

mongoose.connect( process.env.MONGO_URI );
var Drawing = mongoose.model( 'Drawing', {
	surprise: Boolean,
	title: String,
	author: String,
	rawPoints: Array,
	points: Array,
	createdAt: Date
})

hbs.registerHelper( 'ifeq', function (a, b, options) {
	if (a == b) { // eslint-disable-line eqeqeq
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

var app = express();

app.set( 'view engine', 'hbs' );
app.set( 'views', __dirname + '/views' );
app.use( express.static( __dirname + '/public' ) );
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb',extended: true}));

app.get( '/', function( req, res ) {
    res.render( 'home' );
});

app.get( '/drawing/:id', function( req, res ) {
	Drawing.findOne( { _id: req.params.id } )
	.exec( function( err, drawing ) {
		if( err ) {
			res.render( 'error' );
		} else {
			res.render( 'single', { drawing: drawing } );
		}
	});
});

app.get( '/gallery', function( req, res ) {
	Drawing.find()
	.sort( { createdAt: -1 } )
	.exec( function( err, drawings ) {
		if( err ) {
			res.render( 'error' );
		} else {
			res.render( 'gallery', { drawings: drawings } );
		}
	});
});

app.post('/save', function( req, res ) {
	if( req.body && req.body.points && req.body.rawPoints ) {
		var drawing = new Drawing({
			surprise: req.body.surprise,
			title: req.body.title,
			author: req.body.author,
			points: req.body.points,
			rawPoints: req.body.rawPoints,
			createdAt: new Date()
		})
		drawing.save(function( err ) {
			if( err ) {
				res.send( { success: false, error: err, drawing: drawing } );
			} else {
				res.send( { success: true, drawing: drawing } );
			}
		})
	}
})

app.get( '*', function( req, res ) {
    res.render( 'error' );
});

app.listen( process.env.PORT || 3000 );
