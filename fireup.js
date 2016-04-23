#!/usr/bin/env node

'use strict'

var _ = require('lodash');
var yaml = require('js-yaml');
var fs   = require('fs');
var Process = require('./lib/process');
var path = require('path');
var chalk = require('chalk');
var debug = require('debug')('fireup');
var VError = require('verror');

function printUsage() {
  var banner = fs.readFileSync(path.join(__dirname, 'banner.txt'));
  console.log(chalk.red(banner));
  console.log('Simple process launcher for local development');
  console.log('Put .fireup.yml in current directory or pass it as a parameter');
  console.log('See %s for details', path.join(__dirname, 'README.md'));
  console.log(require('./package.json').homepage);
}

try {
  var file = process.argv[2] || '.fireup.yml';
  try {
    var content = fs.readFileSync(file, 'utf8');
  } catch(err) {
    if (!process.argv[2] && err.code === 'ENOENT') {
      printUsage();
      process.exit(1);
    }
    throw err;
  }
  try {
    var doc = yaml.safeLoad(content);
  } catch (err) {
    throw new VError(err, 'Error parsing YAML from %s', file);
  }
  // TODO check doc is an object
  doc.dir = path.dirname(path.resolve(file));
  doc.nameWidth = _.max(doc.processes.map(function(proc) {
    return proc.name.length;
  }));

  var psList = doc.processes.map(function(proc, idx) {
    return new Process(doc, proc, idx);
  });

  psList.forEach(function(p) {
    p.start();
  });
} catch(err) {
  console.error(err.message);
  debug(err);
  process.exit(1);
}
