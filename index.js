require('dotenv').config()
var express = require( 'express' );
var bodyParser = require( 'body-parser' );
var mongoose = require( 'mongoose' );
var hbs = require( 'hbs' );
var fs = require('fs');

// REGISTER HANDLEBARS PARTIALS
var partialsDir = __dirname + '/views/partials';
var filenames = fs.readdirSync(partialsDir);
filenames.forEach(function (filename) {
  var matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  var name = matches[1];
  var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});

// REGISTER HANDLEBARS HELPER
hbs.registerHelper( 'ifeq', function (a, b, options) {
	if (a == b) { // eslint-disable-line eqeqeq
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

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
app.set( 'view engine', 'hbs' );
app.set( 'views', __dirname + '/views' );
app.use( express.static( __dirname + '/public' ) );
app.use( bodyParser.json( { limit: '50mb', parameterLimit: 100000 } ) );
app.use( bodyParser.urlencoded( { limit: '50mb', extended: true, parameterLimit: 100000 } ) );


// ROUTES
app.get( '/', function( req, res ) {
		Drawing.find()
		.sort( { createdAt: -1 } )
		.exec( function( err, drawings ) {
			if( err ) {
				res.render( 'error' );
			} else {
				res.render( 'home', { drawings: drawings } );
			}
		});
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

app.get( '/random', function( req, res ) {
	Drawing.find()
	.sort( { createdAt: -1 } )
	.exec( function( err, drawings ) {
		if( err ) {
			res.render( 'error' );
		} else {
			res.render( 'single', { drawing: drawings[ parseInt( Math.random() * drawings.length ) ] } );
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

app.get( '/about', function( req, res ) {
    res.render( 'about' );
});

app.get( '*', function( req, res ) {
    res.render( 'error' );
});

app.listen( process.env.PORT || 3000, function() {
	console.log( 'Listening to port', process.env.PORT || 3000 );
});
