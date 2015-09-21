var express = require('express');
var bodyParser = require('body-parser');

// app
var app = express();

// logging
app.use(function (req,res,next){
  console.log("\x1b[90m"+req.method+" "+req.url+"\x1b[0m");
  next();
});

// static resources
app.use(express.static('app'));
// app.use('/css', express.static('app/css'));
// app.use('/js', express.static('app/js'));

// request parsers
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));

// route modules
app.use('/api', require('./api'));

// Listen
// listen
var server = app.listen(8486, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('listening at http://jimaku.dev:%s', port);
});
