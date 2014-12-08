utf8-binary-cutter
==================

[![a cutter](https://raw.githubusercontent.com/lemonde/utf8-binary-cutter/master/doc/1390-Straight-cutter-18mm.jpg)](https://github.com/lemonde/utf8-binary-cutter)

A small node.js lib to truncate UTF-8 strings to a given binary size. Useful when dealing with old systems handling UTF-8 as ascii/latin-1, for ex. MySQL or Oracle database.

Usage
=====

* Works on UTF-8 strings (javascript strings are UTF-8)
* truncate so that final size is lower or equal than the given limit :

```javascript
var Cutter = require('utf8-binary-cutter');

var utf8String = 'abc☃☃☃'; // abc then 3 times the UTF-8 « snowman » char which takes 3 bytes

console.log( Cutter.getBinarySize( utf8String ) );  // 1 + 1 + 1 + 3 + 3 + 3 = 12

console.log( Cutter.truncateToBinarySize( utf8String, 20 ) );  'abc☃☃☃'  -> no change
console.log( Cutter.truncateToBinarySize( utf8String, 12 ) );  'abc☃☃☃'  -> no change
console.log( Cutter.truncateToBinarySize( utf8String, 11 ) );  'abc☃...' -> to avoid cutting utf8 chars, the two last snowmen have been removed. Final size = 9 bytes
console.log( Cutter.truncateToBinarySize( utf8String, 10 ) );  'abc☃...' -> idem
console.log( Cutter.truncateToBinarySize( utf8String,  9 ) );  'abc☃...' -> idem
console.log( Cutter.truncateToBinarySize( utf8String,  8 ) );  'abc...'
```

* multiple truncations at the same time :

```javascript
var Cutter = require('utf8-binary-cutter');

var maxBinarySizes = {
  title: 40,
  content: 200
};

console.log( Cutter.truncateFieldsToBinarySize({
    title: '☃☃☃ A véry véry long title with UTF-8 ☃☃☃',
    content: 'I ❤ utf8-binary-cutter !',
    foo: 42
  },
  maxBinarySizes
));

--> {
  title: '☃☃☃ A véry véry long title wi...',
  content: 'I ❤ utf8-binary-cutter !',
  foo: 42
}
```

* callback when truncating (useful for logging)
```
I'm tired of writing doc. Read the source.
```

Contributing
============
* clone
* ensure your editor is decent and pick up the `.editorconfig` and `.jshintrc` files
* `npm install`
* `npm test`
* add tests, add features, send a PR

Thanks !