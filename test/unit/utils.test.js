'use strict';

var expect = require('chai').expect;

var utils = require('../../lib/utils');

describe('utils', function() {
  describe('splitLines', function() {
    it('should split on LF', function() {
      expect(utils.splitLines('one\ntwo')).eql(['one', 'two']);
    });
    it('should split on CR', function() {
      expect(utils.splitLines('one\rtwo')).eql(['one', 'two']);
    });
    it('should split on CRLF', function() {
      expect(utils.splitLines('one\r\ntwo')).eql(['one', 'two']);
    });
    it('should keep empty lines', function() {
      expect(utils.splitLines('one\n\ntwo')).eql(['one', '', 'two']);
    });
    it('should remove last empty line', function() {
      expect(utils.splitLines('one\n')).eql(['one']);
    });
    it('should remove only last empty line', function() {
      expect(utils.splitLines('one\n\n')).eql(['one', '']);
    });
  })
})
