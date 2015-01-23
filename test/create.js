var tape = require('tape');
var create = require('../actions/create.js');
var packet = require('./fixtures/create.json');

function getCreatePacket(includeWeaveENV){
  var ret = JSON.parse(JSON.stringify(packet));

  if(includeWeaveENV){
    ret.Env = ["WEAVE_CIDR=10.255.0.10/8"];
  }

  return ret;
}

tape('Create should expose a single function', function(t){
  t.equal(typeof(create), 'function');
  t.end();
})

tape('inject --volumes-from=weavetools and remap entry point into a create packet', function(t){

  var req = {
    Method:'POST',
    Request:'/containers/create',
    Body:getCreatePacket(true)
  }

  create(req, function(err, response){
    t.deepEqual(response.Body.HostConfig.VolumesFrom, ["parent", "other:ro", "weavewait:ro"], 'weavetools in the volumes from');
    t.equal(response.Body.Cmd, 'ping -c 1 10.255.0.10', 'the entrypoint has been prepended to the cmd');
    t.equal(response.Body.Entrypoint, '/home/weavetools/wait-for-weave', 'the entrypoint has been set to wait-for-weave');
    t.end();
  })

})

tape('dont change create packet when there is no WEAVE_CIDR env', function(t){
  var req = {
    Method:'POST',
    Request:'/containers/create',
    Body:getCreatePacket()
  }

  var copyReq = JSON.parse(JSON.stringify(req))

  create(req, function(err, response){    
    t.deepEqual(copyReq.Body.Entrypoint, response.Body.Entrypoint, 'the entrypoint is unchanged')
    t.deepEqual(copyReq.Body.Cmd, response.Body.Cmd, 'the cmd is unchanged')
    t.deepEqual(copyReq.Body.HostConfig.VolumesFrom, response.Body.HostConfig.VolumesFrom, 'the volumes from is unchanged')
    t.end();
  })
})