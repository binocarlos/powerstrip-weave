var tape = require('tape');
var create = require('../actions/create.js');
var testutils = require('./shared.js');

tape('Create should expose a single function', function(t){
  t.equal(typeof(create), 'function');
  t.end();
})

tape('inject --volumes-from=weavetools and remap entry point into a create packet', function(t){

  var req = {
    Method:'POST',
    Request:'/containers/create',
    Body:testutils.getCreatePacket(true)
  }


  create(req, {
    getImageData:testutils.getImageData
  }, function(err, response){

    var responseBody = JSON.parse(response.Body);
    t.deepEqual(responseBody.HostConfig.VolumesFrom, ["parent", "other:ro", "weavewait:ro"], 'weavetools in the volumes from');
    t.deepEqual(responseBody.Cmd, ['ping', '-c 1 10.255.0.10'], 'the entrypoint has been prepended to the cmd');
    t.deepEqual(responseBody.Entrypoint, ['/home/weavewait/wait-for-weave'], 'the entrypoint has been set to wait-for-weave');
    t.end();
  })

})

tape('dont change create packet when there is no WEAVE_CIDR env', function(t){
  var req = {
    Method:'POST',
    Request:'/containers/create',
    Body:testutils.getCreatePacket()
  }

  var copyReq = JSON.parse(JSON.stringify(req))
  var copyReqBody = JSON.parse(copyReq.Body)

  create(req, {
    getImageData:testutils.getImageData
  }, function(err, response){
    var responseBody = typeof(response.Body)=='string' ? JSON.parse(response.Body) : response.Body;

    t.deepEqual(copyReqBody.Entrypoint, responseBody.Entrypoint, 'the entrypoint is unchanged')
    t.deepEqual(copyReqBody.Cmd, responseBody.Cmd, 'the cmd is unchanged')
    t.deepEqual(copyReqBody.HostConfig.VolumesFrom, responseBody.HostConfig.VolumesFrom, 'the volumes from is unchanged')
    t.end();
  })
})


tape('use the image entrypoint if the container has not specified one', function(t){
  var req = {
    Method:'POST',
    Request:'/containers/create',
    Body:testutils.getCreatePacket(true, true)
  }

  var copyReq = JSON.parse(JSON.stringify(req))
  var copyReqBody = JSON.parse(copyReq.Body)

  create(req, {
    getImageData:testutils.getImageData
  }, function(err, response){
    var responseBody = typeof(response.Body)=='string' ? JSON.parse(response.Body) : response.Body;

    t.deepEqual(responseBody.Entrypoint, ['/home/weavewait/wait-for-weave'], 'the entrypoint is changed to wait-for-weave')
    t.deepEqual(responseBody.Cmd, ['ping', '-c 1 10.255.0.10'], 'the cmd is a combo of the original entrypoint and cmd')

    t.end();
  })
})