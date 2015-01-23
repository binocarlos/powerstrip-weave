var tape = require('tape');
var create = require('../actions/create.js');
var packet = require('./fixtures/create.json');

function getCreatePacket(includeWeaveENV){
  var ret = JSON.parse(JSON.stringify(packet));

  if(includeWeaveENV){
    ret.Env = ["WEAVE_CIDR=10.255.0.10/8"];
  }

  return JSON.stringify(ret);
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

    var responseBody = JSON.parse(response.Body)
    t.deepEqual(responseBody.HostConfig.VolumesFrom, ["parent", "other:ro", "weavewait:ro"], 'weavetools in the volumes from');
    t.equal(responseBody.Cmd, 'ping -c 1 10.255.0.10', 'the entrypoint has been prepended to the cmd');
    t.equal(responseBody.Entrypoint, '/home/weavewait/wait-for-weave', 'the entrypoint has been set to wait-for-weave');
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
  var copyReqBody = JSON.parse(copyReq.Body)

  create(req, function(err, response){
    var responseBody = JSON.parse(response.Body)
    
    t.deepEqual(copyReqBody.Entrypoint, responseBody.Entrypoint, 'the entrypoint is unchanged')
    t.deepEqual(copyReqBody.Cmd, responseBody.Cmd, 'the cmd is unchanged')
    t.deepEqual(copyReqBody.HostConfig.VolumesFrom, responseBody.HostConfig.VolumesFrom, 'the volumes from is unchanged')
    t.end();
  })
})