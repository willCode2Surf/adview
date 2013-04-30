var fs = require('fs');
var url = require('url');
var path = require('path');
var http = require('http');
var jade = require('jade');
var express = require('express');
var redis = require('redis');

var renderAd = require('./lib/render-ad.js');

var conn = redis.createClient();

var creativeDirectory = path.join(__dirname, 'public', 'creatives');
var availableCreatives = fs.readdirSync(creativeDirectory);

// Make a new app instance
var app = express();

app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());


// ---
// API
// ---

app.get('/api/campaigns', function(req, res){
  conn.hgetall('campaigns', function(err, data){

    // Create a new array to hold campaign objects
    var campaigns = [];

    // Loop through each JSON String and convert to an Object
    for (var key in data) {
      var thisRecord = data[key];
      campaigns.push(JSON.parse(thisRecord));
    }

    // Respond with the array of objects
    res.json(campaigns);

  });

});


// --------
// Admin UI
// --------

app.get('/admin*', function(req, res){
  res.render('index.jade');
});

app.get('/template/:name', function(req, res){
  res.render('templates/' + req.params.name + '.jade');
});


// ---------
// Serve Ads
// ---------

app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<iframe src="/showBanner" width="300" height="250" frameborder="0" />');
});

app.get('/showBanner', function(req, res) {
  var fileName = availableCreatives[Math.floor(Math.random() * availableCreatives.length)];
  var embedCode = renderAd('/creatives/' + fileName, 'http://bing.com');

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<html><body style="margin: 0;">' + embedCode + '</body></html>');
});


// Start the server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



