var tape = require('tape')
var utils = require('./utils')

tape('extract a container id from a /containers/start request', function(t){

  var id = utils.extractStartID('/v1.16/containers/12345/start')

  t.equal(id, '12345', 'the id is extracted')
  t.end()
})