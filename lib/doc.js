'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var VError = require('verror');
var yaml = require('js-yaml');
var assert = require('assert');
var util = require('util');

exports.load = function (fileParam) {
  try {
    var file = fileParam || 'fireup.yml';
    var doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    assert(isObject(doc), 'YAML content should be an object');
    assert(isObject(doc.processes), '"processes" property should be an object');

    doc.dir = path.dirname(path.resolve(file));

    for (var name in doc.processes) {
      var proc = doc.processes[name];
      assert(proc && (typeof proc === 'string' || isObject(proc)),
        '"' + name + '" property should be a string or an object');
      if (typeof proc === 'string') {
        proc = { cmd: proc };
        doc.processes[name] = proc;
      }
      assert(proc.cmd && typeof proc.cmd === 'string',
        name + '.cmd should be a string');
    }

    doc.nameWidth = _.max(_.keys(doc.processes).map(function (name) {
      return name.length;
    }));

    return doc;
  } catch (err) {
    throw new VError(err, 'Error loading YAML file %s', file);
  }
}

function isObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}



