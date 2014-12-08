/*
 * Utilities for truncating text fields to fit into some Oracle tables.
 * Truncate must be done binary-wise on an UTF-8 string.
 * Ex. a 4000 chars UTF-8 french string may takes ~4200 bytes (depending on content)
 *
 * Note : even if default, we explicitely specify «utf8» since it's a requirement.
 */
'use strict';

var _ = require('lodash');

var DEFAULT_TRUNCATE_STRING = '...';
var DEFAULT_TRUNCATE_STRING_BINARY_SIZE = Buffer.byteLength(DEFAULT_TRUNCATE_STRING, 'utf8');

module.exports = {
  getBinarySize: getBinarySize,
  truncateToBinarySize: truncateToBinarySize,
  truncateFieldsToBinarySize: truncateFieldsToBinarySize
};

/* Return size, in bytes, of the given UTF-8 string.

 * @param [String] string
 * @return [Number] size of the string in bytes
 */
function getBinarySize(string) {
  return Buffer.byteLength(string, 'utf8');
}

/*
 * Get a copy of the given UTF-8 string truncated to a max *binary* size.
 * Avoid truncating in the middle of an UTF-8 char.
 * If truncated, the returned string will have a trailing "...",
 * still respecting the max binary size.
 *
 * Note : desired binary size must be at last 3.
 * Note : the returned string size may be smaller than desired size due to UTF-8 wide chars.
 *
 * @param [String] string
 * @param [Number] binaryMaxSize - the max size we should enforce
 * @param [function()] truncateCallback - if provided, function to be called when a truncating occur.
 *                   Useful for displaying a log.
 */
function truncateToBinarySize(string, binaryMaxSize, truncateCallback) {
  if(getBinarySize(string) <= binaryMaxSize) return string; // OK

  if(truncateCallback) truncateCallback();

  // we'll use buffer.write to truncate,
  // since it doesn't overflow neither write partial UTF-8 characters.
  var truncatingBuffer = new Buffer(binaryMaxSize - DEFAULT_TRUNCATE_STRING_BINARY_SIZE);
  var writtenBinaryLength = truncatingBuffer.write(string, 'utf8');
  return truncatingBuffer.toString('utf8', 0, writtenBinaryLength) + DEFAULT_TRUNCATE_STRING;
}

/*
 * On the given object, apply truncateToBinarySize to all members
 * for whom a binary max size is provided.
 * Useful to quickly truncate a model.
 * @see truncateToBinarySize
 *
 * @param [Object]
 * @param [Object] maxSizes - a hash {<member name>: <max binary size>}
 * @param [function(field, actualSize, maxSize)] truncateCallback
 *                   if provided, function to be called when a truncating occur.
 */
function truncateFieldsToBinarySize(model, maxSizes, truncateCallback) {
  return _.transform(
    model,
    function (result, value, key) {
      value = _.contains(Object.keys(maxSizes), key) ? truncateToBinarySize(value, maxSizes[key]) : value;
      result[key] = value;
    }
  );
}
