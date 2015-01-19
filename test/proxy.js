var tape = require('tape')
var proxy = require('../proxy.js')


tape('the proxy should expose a single function', function(t){
  t.equal(typeof(proxy), 'function')
  t.end()
})