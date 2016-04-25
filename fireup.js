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
var utils = require('./lib/utils');

function printUsage() {
  var banner = fs.readFileSync(path.join(__dirname, 'banner.txt'));
  console.log(chalk.red(banner));
  console.log('Simple process launcher for local development');
  console.log('Put .fireup.yml in current directory or pass it as a parameter');
  console.log('See %s for details', path.join(__dirname, 'README.md'));
  console.log(require('./package.json').homepage);
}

function validateDoc(doc) {
  if (!doc || typeof doc !== 'object') {
    throw new Error('Content is not an object');
  }
  if (!doc.processes) {
    throw new Error('Missing mandatory property "processes"');
  }
}

function loadDoc(fileParam) {
  var file = fileParam || '.fireup.yml';
  try {
    var doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    validateDoc(doc);
  } catch(err) {
    throw new VError(err, 'Error loading YAML file %s', file);
  }
  doc.dir = path.dirname(path.resolve(file));
  doc.nameWidth = _.max(doc.processes.map(function(proc) {
    return proc.name.length;
  }));
  return doc;
}

try {
  var file = process.argv[2];
  if (!file && !utils.exists('.fireup.yml')) {
      printUsage();
      process.exit(1);
  }
  var doc = loadDoc(file);
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
