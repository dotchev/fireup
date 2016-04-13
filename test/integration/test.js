'use strict'

var expect = require('chai').expect;
var assert = require('chai').assert;
var path = require('path');
var execFileSync = require('child_process').execFileSync;
var _ = require('lodash');
var splitLines = require('../../utils').splitLines;

var node = process.execPath;
var main = path.resolve('fireup.js');

function fireup(args, options) {
  var ar = [main].concat(args || []);
  options = _.merge({
    encoding: 'utf8',
    cwd: __dirname,
    env: process.env
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

describe('fireup', function() {
  it('should use .fireup.yml from current directory by default', function() {
    var out = fireup();
    expect(out).match(/^hello> Hello world!$/m);
  });

  it('should print child output', function() {
    var out = fireup(['print2.yml']);
    matchLines(out, [
      /^print2 started with pid \d+$/,
      'print2> first',
      'print2> second',
      'print2 exited with code 0'
    ]);
  });

  it('should prefix each line with process name', function() {
    var out = fireup(['print-me.yml']);
    matchLines(out, [
      /^print-me started with pid \d+$/,
      'print-me> first',
      'print-me> ',
      'print-me> second',
      'print-me exited with code 0'
    ]);
  });

  it('should start process with proper environment: current env > document env > process env', function() {
    var out = fireup(['../app/test-env.yml'], {
      env: {
        VAR_A1: 'a1',
        VAR_A2: 'a2',
        VAR_A3: 'a3'
      }
    });
    expect(splitLines(out).slice(1, -1)).eql([
      'print-env> VAR_A1=a1b',
      'print-env> VAR_A2=a2c',
      'print-env> VAR_A3=a3',
      'print-env> VAR_B1=b1c',
      'print-env> VAR_B2=b2',
      'print-env> VAR_C1=c1',
    ]);
  });

  it('should align messages from different processes', function() {
    var out = fireup(['proc2.yml']);
    var lines = splitLines(out);
    expect(lines).contain('p1   > Hello one');
    expect(lines).contain('proc2> Hello two');
  });

  it('should start process in proper workind directory: yml dir > process dir', function() {
    var out = fireup(['../app/test-cwd.yml']);
    var lines = splitLines(out);
    var testDir = path.dirname(__dirname);
    expect(lines).contain('default-dir > ' + path.resolve(testDir, 'app'));
    expect(lines).contain('relative-dir> ' + path.resolve(testDir, 'unit'));
    expect(lines).contain('absolute-dir> ' + path.resolve('/'));
  });

});
