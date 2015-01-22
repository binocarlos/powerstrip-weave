var tape = require('tape')
var utils = require('../utils')
var inspect = require('./fixtures/inspect')

tape('extract a container id from a /containers/start request', function(t){

  var id = utils.extractStartID('/v1.16/containers/12345/start')

  t.equal(id, '12345', 'the id is extracted')
  t.end()
})

tape('extract the WEAVE_CIDR env variable from a docker inspect packet', function(t){

  var cidr = utils.extractWeaveEnv(inspect)

  t.equal(cidr, '10.255.0.10/8')
  t.end()
})