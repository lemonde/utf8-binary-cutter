'use strict';

var chai = require('chai');
var expect = chai.expect;

var Utf8BinaryCutter = require('../main');


describe('UTF-8 binary cutter', function () {

  describe('#getBinarySize', function() {
    it('should correctly compute binary size of strings', function () {
      expect(Utf8BinaryCutter.getBinarySize('')).to.equals(0);
      expect(Utf8BinaryCutter.getBinarySize('123')).to.equals(3);
      // REM âêîôûŷ chars take 2 bytes each
      expect(Utf8BinaryCutter.getBinarySize('âêîôû')).to.equals(10);
      // REM : a snowman takes 3 bytes
      expect(Utf8BinaryCutter.getBinarySize('x☃☃☃')).to.equals(10);
    });
  });

  describe('#truncateToBinarySize', function() {
    it('should leave as is undersized strings', function () {
      var limit = 10;

      // pure ascii
      expect(Utf8BinaryCutter.truncateToBinarySize('', limit)).to.equals('');
      expect(Utf8BinaryCutter.truncateToBinarySize('123', limit)).to.equals('123');
      expect(Utf8BinaryCutter.truncateToBinarySize('1234567890', limit)).to.equals('1234567890');

      // UTF-8 mixed
      // REM âêîôûŷ chars take 2 bytes each
      expect(Utf8BinaryCutter.truncateToBinarySize('âêîôû', limit)) // 5x2 = 10 OK
        .to.equals('âêîôû');
      // REM : a snowman takes 3 bytes
      expect(Utf8BinaryCutter.truncateToBinarySize('x☃☃☃', limit)) // 1 + 3x3 = 10 OK
        .to.equals('x☃☃☃');
    });

    it('should truncate oversized strings on correct chars boundaries', function () {
      var limit = 10;

      // pure ascii
      expect(Utf8BinaryCutter.truncateToBinarySize('12345678901', limit)).to.equals('1234567...');
      expect(Utf8BinaryCutter.truncateToBinarySize('123456789012', limit)).to.equals('1234567...');
      expect(Utf8BinaryCutter.truncateToBinarySize('1234567890123', limit)).to.equals('1234567...');
      expect(Utf8BinaryCutter.truncateToBinarySize('12345678901234', limit)).to.equals('1234567...');
      expect(Utf8BinaryCutter.truncateToBinarySize('12345678901234foobar', limit)).to.equals('1234567...');

      // UTF-8 mixed
      expect(Utf8BinaryCutter.truncateToBinarySize('âêîôûŷ', limit)) // 6x2 = 12 NOK
        .to.equals('âêî...'); // only 3x2 can fit, +3 dots = 9 bytes, OK
      expect(Utf8BinaryCutter.truncateToBinarySize('xâêîôû', limit)) // 1 + 5x2 = 11 NOK, UTF-8 boundary shifted
        .to.equals('xâêî...'); // 1 + 3x2 can fit, +3 dots = 10 bytes, OK
      expect(Utf8BinaryCutter.truncateToBinarySize('☃☃☃☃', limit)) // 4x3 = 12 NOK
        .to.equals('☃☃...'); // only 2x3 can fit, +3 dots = 9 bytes, OK
    });
  });

  describe('#truncateFieldsToBinarySize', function() {

    it('should apply truncateToBinarySize on attributes with a provided max size', function () {
      var maxOracleSizes = {
        limitedTo10a: 10,
        limitedTo10b: 10,
        limitedTo10c: 10,
        limitedTo10d: 10
      };

      var modelAscii = {
        unlimiteda: '12345678901234foobar',
        unlimitedb: { foo: 'bar'},
        limitedTo10a: '1234567890',
        limitedTo10b: '12345678901'
      };

      expect(Utf8BinaryCutter.truncateFieldsToBinarySize(modelAscii, maxOracleSizes)).to.deep.equals({
        unlimiteda: '12345678901234foobar',
        unlimitedb: { foo: 'bar'},
        limitedTo10a: '1234567890',
        limitedTo10b: '1234567...'
      }, 'ascii');

      var modelUTF8 = {
        unlimiteda: '12345678901234föobâr',
        unlimitedb: { foo: 'bâr'},
        limitedTo10a: 'âêîôû',
        limitedTo10b: 'âêîôûŷ',
        limitedTo10c: 'xâêîôû',
        limitedTo10d: '☃☃☃☃'
      };

      expect(Utf8BinaryCutter.truncateFieldsToBinarySize(modelUTF8, maxOracleSizes)).to.deep.equals({
        unlimiteda: '12345678901234föobâr',
        unlimitedb: { foo: 'bâr'},
        limitedTo10a: 'âêîôû', // no change
        limitedTo10b: 'âêî...',
        limitedTo10c: 'xâêî...',
        limitedTo10d: '☃☃...'
      }, 'utf-8');
    });

  });

});
