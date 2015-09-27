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

// request parsers
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));

// route modules
app.use('/api', require('./api'));

// catch all to index
app.use(function(req,res,next){
  if (/^\/cs|\/js/.test(req.url)) {
    next();
  } else {
    // console.log('->', req.url, __dirname + '/app/index.html')
    res.sendFile(__dirname + '/app/index.html');
  }
});

// listen
var server = app.listen(8486, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('listening at http://jimaku.dev:%s', port);
});
