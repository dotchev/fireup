'use strict';

console.log('Waiting 5s ...');

setTimeout(function () {
  console.error('Timeout');
}, 5000);

process.on('SIGINT', function () {
  console.log('got SIGINT');
  process.exit(55);
});
