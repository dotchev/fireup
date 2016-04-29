'use strict';

var http = require('http');

var server = http.createServer(function (req, res) {
  console.log('%s %s', req.method, req.url);
  var m = req.url.match(/(\d+)/);
  if (m && m[1]) {
    var ttl = +m[1];
    if (--ttl > 0) {
      http.get(process.env.PEER + '/' + ttl, function (resp) {
        res.writeHead(200);
        res.end();
      }).on('error', function (err) {
        console.error(err);
        res.writeHead(500);
        res.end(err.message);
      });
    } else {
      res.writeHead(200);
      res.end();
    }
  } else {
    res.writeHead(400);
    res.end('No TTL');
  }
});
server.listen(process.env.PORT || 8000, function () {
  console.log('Listening on port %d', server.address().port);
});
