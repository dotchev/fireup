#!/usr/bin/env node

'use strict'

var fs = require('fs');
var Process = require('./lib/process');
var path = require('path');
var chalk = require('chalk');
var debug = require('debug')('fireup');
var utils = require('./lib/utils');
var load = require('./lib/doc').load;

function printUsage() {
  var banner = fs.readFileSync(path.join(__dirname, 'banner.txt'));
  console.log(chalk.red(banner));
  console.log('Simple process launcher for local development');
  console.log('Put fireup.yml in current directory or pass it as a parameter');
  console.log('See %s for details', path.join(__dirname, 'README.md'));
  console.log(require('./package.json').homepage);
}

function main() {
  var file = process.argv[2];
  if (!file && !utils.exists('fireup.yml')) {
    printUsage();
    process.exit(1);
  }
  var doc = load(file);
  var ps = {}
  for (var p in doc.processes) {
    ps[p] = new Process(doc, p);
    ps[p].start();
  }

  process.on('SIGINT', function () {
    debug('User interrupt, killing all processes');
    for (p in ps) {
      ps[p].kill('SIGINT');
    }
  });
}

try {
  main();
} catch (err) {
  console.error(err.message);
  debug(err);
  process.exit(1);
}
