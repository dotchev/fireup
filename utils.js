'use stric';

var _ = require('lodash');

module.exports.splitLines = function(text) {
  var lines = text.split(/\r\n?|\n/);
  if (!_.last(lines)) lines.pop();
  return lines;
}
