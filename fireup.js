#!/usr/bin/env node

'use strict'

var _ = require('lodash');
var yaml = require('js-yaml');
var fs   = require('fs');
var Process = require('./lib/process');
var path = require('path');

var file = process.argv[2] || '.fireup.yml';
var doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
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
