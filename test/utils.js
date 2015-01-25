var tape = require('tape');
var utils = require('../utils');
var inspect = require('./fixtures/inspect.json');

tape('extract a container id from a /containers/start request', function(t){

  var id = utils.extractStartID('/v1.16/containers/12345/start');

  t.equal(id, '12345', 'the id is extracted');
  t.end();
})

tape('extract the Env from an inspect packet', function(t){

  var env = utils.extractEnvFromInspectPacket(inspect)

  t.deepEquals(env, [
    "WEAVE_CIDR=10.255.0.10/8",
    "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
  ], 'the env has been extracted')

  t.end();
})

tape('extract the WEAVE_CIDR env variable from a docker inspect packet', function(t){

  var cidr = utils.extractWeaveEnv(inspect.Config.Env);

  t.equal(cidr, '10.255.0.10/8');
  t.end();
})

tape('combine the image and container entrypoint and command', function(t){
  var test1 = {
    imageEntry:'testscript',
    imageCommand:['a', 'b', 'c'],
    containerEntry:'testscript2'
  }

  var result1 = utils.combineEntryPoints(test1.imageEntry, test1.containerEntry, test1.imageCommand, test1.containerCommand)
  t.deepEqual(result1, ['testscript2', 'a', 'b', 'c'], 'container entry overrides image entry')

  var test2 = {
    imageEntry:'testscript',
    imageCommand:['a', 'b', 'c'],
    containerCommand:['x', 'y', 'z']
  }

  var result2 = utils.combineEntryPoints(test2.imageEntry, test2.containerEntry, test2.imageCommand, test2.containerCommand)
  t.deepEqual(result2, ['testscript', 'x', 'y', 'z'], 'container command overrides image command')


  var test3 = {
    imageEntry:'testscript',
    imageCommand:['a', 'b', 'c']
  }

  var result3 = utils.combineEntryPoints(test3.imageEntry, test3.containerEntry, test3.imageCommand, test3.containerCommand)
  t.deepEqual(result3, ['testscript', 'a', 'b', 'c'], 'image entry + command')

  var test4 = {
    imageEntry:'testscript',
    imageCommand:['a', 'b', 'c'],
    containerEntry:'testscript2',
    containerCommand:['x', 'y', 'z']
  }

  var result4 = utils.combineEntryPoints(test4.imageEntry, test4.containerEntry, test4.imageCommand, test4.containerCommand)
  t.deepEqual(result4, ['testscript2', 'x', 'y', 'z'], 'container entry + command overrides both')

  t.end()
})