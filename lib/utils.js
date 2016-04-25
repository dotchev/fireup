'use stric';

var _ = require('lodash');
var fs = require('fs');

exports.splitLines = function(text) {
  var lines = text.split(/\r\n?|\n/);
  if (!_.last(lines)) lines.pop();
  return lines;
}

exports.exists = function(file) {
  try {
    return fs.statSync(file);
  } catch(err) {}
}