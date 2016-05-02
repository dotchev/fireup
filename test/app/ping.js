'use strict';

var http = require('http');
var requestretry = require('requestretry');

function requestR(url, cb) {
  requestretry({
    url: url,
    maxAttempts: process.env.MAX_ATTEMPTS,
    retryDelay: process.env.RETRY_DELAY,
    retryStrategy: requestretry.RetryStrategies.NetworkError
  }, cb);
}

var server = http.createServer(function (req, res) {
  console.log('%s %s', req.method, req.url);
  var m = req.url.match(/(\d+)/);
  if (m && m[1]) {
    var ttl = +m[1];
    if (--ttl > 0) {
      requestR(process.env.PEER + '/' + ttl, function (err, response, body) {
        if (err) {
          console.error(err);
          res.writeHead(500);
          res.end(err.message);
        } else {
          res.writeHead(200);
          res.end();
        }
      });
    } else {
      res.writeHead(200);
      res.end();
    }
  } else {
    res.writeHead(400);
    res.end('No TTL');
  }
  res.on('finish', function () {
    server.close();
  })
});

server.listen(process.env.PORT || 8000, function () {
  console.log('Listening on port %d', server.address().port);

  var ttl = process.argv[2];
  if (ttl) {
    requestR(process.env.PEER + '/' + ttl, function (err, response, body) {
      if (err) {
        console.error(err);
        server.close();
      }
    });
  }
});

// safety net, close the server and exit if there are no requests
setTimeout(function() {
  server.close();
}, process.env.MAX_ATTEMPTS * process.env.RETRY_DELAY).unref();
