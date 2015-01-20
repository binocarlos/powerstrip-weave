var tape = require('tape')
var create = require('../actions/create.js')
var packet = require('./fixtures/create.json')

function getCreatePacket(){
  return JSON.parse(JSON.stringify(packet))
}

tape('Create should expose a single function', function(t){
  t.equal(typeof(create), 'function')
  t.end()
})

tape('inject --volumes-from=weavetools into a create packet', function(t){

  var req = {
    Method:'POST',
    Request:'/containers/create',
    Body:getCreatePacket()
  }

  create(req, function(err, code, response){
    t.equal(code, 200, 'the create code is 200')
    t.deepEqual(response.Body.HostConfig.VolumesFrom, ["parent", "other:ro", "weavetools:ro"], 'weavetools in the volumes from')
    t.equal(response.Body.Cmd, 'ping -c 1 10.255.0.10', 'the entrypoint has been prepended to the cmd')
    t.equal(response.Body.Entrypoint, '/home/weavetools/wait-for-weave', 'the entrypoint has been set to wait-for-weave')
    t.end()
  })

})