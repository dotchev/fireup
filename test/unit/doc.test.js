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

    it('if process is a string, should assign it to cmd property', function () {
      fs.readFileSync.returns(
        "processes:\n" +
        "  proc: start proc");
      expect(load()).eql({
        processes: {
          proc: {
            cmd: 'start proc'
          }
        },
        nameWidth: 4,
        dir: path.resolve('.')
      });
    });

    it('should throw error, if YAML content is not an object', function () {
      fs.readFileSync.returns("a string");
      expect(load).to.throw(/YAML content should be an object/);
    });

    it('should throw error, if processes property is missing', function () {
      fs.readFileSync.returns("a: b");
      expect(load).to.throw(/"processes" property should be an object/);
    });

    it('should throw error, if processes property is not an object', function () {
      fs.readFileSync.returns("processes: abc");
      expect(load).to.throw(/"processes" property should be an object/);
    });

    it('should throw error, if a process property is a number', function () {
      fs.readFileSync.returns(
        "processes:\n" +
        "  proc: 4");
      expect(load).to.throw(/"proc" property should be a string or an object/);
    });

    it('should throw error, if cmd property is missing', function () {
      fs.readFileSync.returns(
        "processes:\n" +
        "  proc:\n" +
        "    dir: /path");
      expect(load).to.throw(/proc.cmd should be a string/);
    });

  });
});
