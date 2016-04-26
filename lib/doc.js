'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var VError = require('verror');
var yaml = require('js-yaml');
var assert = require('assert');

exports.load = function(fileParam) {
  var file = fileParam || 'fireup.yml';
  try {
    var doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    validate(doc);
  } catch(err) {
    throw new VError(err, 'Error loading YAML file %s', file);
  }
  doc.dir = path.dirname(path.resolve(file));
  doc.nameWidth = _.max(_.keys(doc.processes).map(function(name) {
    return name.length;
  }));
  return doc;
}

function isObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

function validate(doc) {
  assert(isObject(doc), 'YAML content should be an object');
  assert(isObject(doc.processes), '"processes" property should be an object');
}


