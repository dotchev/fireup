'use strict'

var expect = require('chai').expect;
var assert = require('chai').assert;
var path = require('path');
var execFileSync = require('child_process').execFileSync;
var _ = require('lodash');
var splitLines = require('../../utils').splitLines;

var node = process.execPath;
var main = path.resolve('siman.js');

function siman(args, options) {
  var ar = [main].concat(args || []);
  options = _.assign({
    encoding: 'utf8',
    cwd: __dirname
  }, options);
  return execFileSync(node, ar, options);
}

function matchLines(text, patterns) {
  var lines = splitLines(text);
  expect(lines.length).equal(patterns.length);
  for (var i = 0; i < lines.length; ++i) {
    if (typeof patterns[i] === 'string') {
      expect(lines[i]).equal(patterns[i]);
    } else {
      expect(lines[i]).match(patterns[i]);
    }
  }
}

describe('siman', function() {
  it('should use siman.yml from current directory by default', function() {
    var out = siman();
    expect(out).match(/^hello> Hello world!$/m);
  });

  it('should print child output', function() {
    var out = siman(['print2.yml']);
    matchLines(out, [
      /^print2 started with pid \d+$/,
      'print2> first',
      'print2> second',
      'print2 exited with code 0'
    ]);
  });

  it('should prefix each line with process name', function() {
    var out = siman(['print-me.yml']);
    matchLines(out, [
      /^print-me started with pid \d+$/,
      'print-me> first',
      'print-me> ',
      'print-me> second',
      'print-me exited with code 0'
    ]);
  });

  it('should start process with proper environment', function() {
    var out = siman(['test-env.yml']);
    expect(splitLines(out)[1]).equal('test-env> aaa B2 C2');
  });
});
