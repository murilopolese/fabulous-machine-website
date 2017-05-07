'use strict';

// LOAD ENVIRONMENT VARIABLES
require('dotenv').config();

let express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    // DEFINE Schema
    Schema = new mongoose.Schema({
        surprise: Boolean,
        title: String,
        author: String,
        rawPoints: Array,
        points: Array
    }),
    timestamps = require('mongoose-timestamp'),
    app = express(),
    REST = require('express-restify')(app);

// ADD TIMESTAMPS TO DRAWING MODEL SO IT WILL GET AUTOMATICALLY 'createdAt' and `updatedAt`
Schema.plugin(timestamps);

// DEFINE MODEL
let Drawing = mongoose.model('Drawing', Schema);

// CONNECT TO DATABASE
mongoose.connect(process.env.MONGO_URI || 'mongodb://172.17.0.2:27017/fabulous-machines');

// START AND CONFIGURE EXPRESS APP
app.use(express.static(__dirname + '/app'));
app.use(bodyParser.json({
    limit: '50mb',
    parameterLimit: 100000
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 100000
}));

// REST ROUTES
REST.register({
    url: '/drawings',
    model: 'Drawing'
});

// CUSTOM ROUTES
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/app/index.html');
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Listening to port', process.env.PORT || 3000);
});
