'use strict'

var expect = require('chai').expect;
var assert = require('chai').assert;
var path = require('path');
var execFileSync = require('child_process').execFileSync;
var execFile = require('child_process').execFile;
var _ = require('lodash');
var splitLines = require('../../lib/utils').splitLines;
var http = require('http');

var node = process.execPath;
var main = path.resolve('fireup.js');

function fireup(args, options, cb) {
  var ar = [main].concat(args || []);
  options = _.merge({
    encoding: 'utf8',
    stdio: 'pipe',
    cwd: __dirname,
    env: _.clone(process.env)
  }, options);
  return (typeof cb === 'function') ?
    execFile(node, ar, options, cb) :
    execFileSync(node, ar, options);
}

function fireupErr(args, options, exitCode) {
  try {
    fireup(args, options);
    assert(false, 'Did not throw');
  } catch (err) {
    if (exitCode !== undefined) {
      expect(err.status).equal(exitCode);
    }
    return err;
  }
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

describe('fireup', function () {
  this.slow(500);

  it('should use fireup.yml from current directory by default', function () {
    var out = fireup();
    expect(out).match(/^hello> Hello world!$/m);
  });

  it('should print usage not error, if fireup.yml is not present', function () {
    var err = fireupErr([], {
      cwd: __dirname + '/empty'
    }, 1);
    expect(err.stdout).to.match(/README.md/m);
    expect(err.stdout).not.match(/Error/m);
    expect(err.stderr).not.match(/Error/m);
  });

  it('should exit with error, if given file does not exist', function () {
    var err = fireupErr(['no-such-file'], {
      cwd: __dirname + '/empty'
    }, 1);
    expect(err.stdout).to.be.empty;
    expect(err.stderr).to.match(/ENOENT.*no-such-file/m);
    expect(err.stderr).to.not.match(/^\s*at\s+/m); // not stack trace
  });

  it('should print stack trace, if DEBUG is defined', function () {
    var err = fireupErr(['no-such-file'], {
      cwd: __dirname + '/empty',
      env: {
        DEBUG: 'fireup'
      }
    }, 1);
    expect(err.stderr).to.match(/ENOENT.*no-such-file/m);
    expect(err.stderr).to.match(/^\s*at\s+/m); // not stack trace
  });

  it('should exit with error, if given file is not valid YAML', function () {
    var err = fireupErr(['invalid.yml'], {}, 1);
    expect(err.stderr).to.match(/YAML.*invalid\.yml/m);
  });

  it('should exit with error, if YAML content is not an object', function () {
    var err = fireupErr(['string.yml'], {}, 1);
    expect(err.stderr).to.match(/Error.*string\.yml.*object/m);
  });

  it('should exit with error, if processes property is missing', function () {
    var err = fireupErr(['no-processes.yml'], {}, 1);
    expect(err.stderr).to.match(/Error.*no-processes\.yml.*processes/m);
  });

  it('should print child output', function () {
    var out = fireup(['print2.yml']);
    matchLines(out, [
      /^print2 started with pid \d+$/,
      'print2> first',
      'print2> second',
      'print2 exited with code 0'
    ]);
  });

  it('should prefix each line with process name', function () {
    var out = fireup(['print-me.yml']);
    matchLines(out, [
      /^print-me started with pid \d+$/,
      'print-me> first',
      'print-me> ',
      'print-me> second',
      'print-me exited with code 0'
    ]);
  });

  it('should start process with proper environment: current env > document env > process env', function () {
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

  it('should align messages from different processes', function () {
    var out = fireup(['proc2.yml']);
    var lines = splitLines(out);
    expect(lines).contain('p1   > Hello one');
    expect(lines).contain('proc2> Hello two');
  });

  it('should start process in proper workind directory: yml dir > process dir', function () {
    var out = fireup(['../app/test-cwd.yml']);
    var lines = splitLines(out);
    var testDir = path.dirname(__dirname);
    expect(lines).contain('default-dir > ' + path.resolve(testDir, 'app'));
    expect(lines).contain('relative-dir> ' + path.resolve(testDir, 'unit'));
    expect(lines).contain('absolute-dir> ' + path.resolve('/'));
  });

  it('should merge output form different processes', function (done) {
    var child = fireup(['../app/ping-pong.yml'], {}, function (err, stdout, stderr) {
      var lines = splitLines(stdout);
      if (lines.length != 10) {
        console.log('complete:', err, stdout, stderr);
        return done(new Error('Bad output'));
      }
      expect(lines.slice(4, 8)).eql([
        'ping> GET /4',
        'pong> GET /3',
        'ping> GET /2',
        'pong> GET /1']);
      done();
    });
    setTimeout(function () {
      http.get('http://localhost:8000/4', function (res) {
        child.kill('SIGINT');
      }).on('error', function (err) {
        child.kill('SIGINT');
        done(err);
      });
    }, 500);

  });
});
