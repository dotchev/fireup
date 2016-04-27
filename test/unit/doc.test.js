'use strict';

var sinon = require('sinon');
var fs = require('fs');
var expect = require('chai').expect;
var doclib = require('../../lib/doc');
var path = require('path');

describe('doc', function () {
  describe('load', function () {
    var load = doclib.load;

    beforeEach(function () {
      sinon.stub(fs, 'readFileSync');
    });
    afterEach(function () {
      fs.readFileSync.restore();
    })

    it('should load processes object', function () {
      fs.readFileSync.returns(
        "processes:\n" +
        "  alpha:\n" +
        "    cmd: start one\n" +
        "  beta:\n" +
        "    cmd: start two\n");
      expect(load('/a/b/c.yml')).eql({
        processes: {
          alpha: {
            cmd: 'start one'
          },
          beta: {
            cmd: 'start two'
          }
        },
        nameWidth: 5,
        dir: path.resolve('/a/b')
      });
    });
  });
});
