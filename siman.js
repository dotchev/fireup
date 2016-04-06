'use strict'

var _ = require('lodash');
var yaml = require('js-yaml');
var fs   = require('fs');
var Process = require('./process');

var file = process.argv[2] || 'siman.yml';
var doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));

doc.nameWidth = _.max(doc.processes.map(function(proc) {
  return proc.name.length;
}));

var psList = doc.processes.map(function(proc, idx) {
  return new Process(doc, proc, idx);
});

psList.forEach(function(p) {
  p.start();
});
