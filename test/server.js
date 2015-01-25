var tape = require('tape');
var Server = require('../server.js');
var concat = require('concat-stream');
var hyperquest = require('hyperquest');
var testutils = require('./shared');

tape('Server should expose a single function', function(t){
  t.equal(typeof(Server), 'function');
  t.end();
})

tape('Server should handle a create request', function(t){

  var server = Server({
    getImageData:testutils.getImageData,
    getContainerData:testutils.getContainerData,
    runWeaveAttach:testutils.runWeaveAttach
  })
  
  server.listen(8080, function(){

    var req = hyperquest.post('http://127.0.0.1:8080/extension')

    req.pipe(concat(function(body){

      body = JSON.parse(body.toString());

      t.equal(body.PowerstripProtocolVersion, 1, 'the PowerstripProtocolVersion is 1');
      t.equal(body.ModifiedClientRequest.Method, 'POST', 'the Method of the ModifiedClientRequest is POST');
      t.equal(body.ModifiedClientRequest.Request, '/v1.16/containers/create', 'the Request url is correct');
      t.equal(typeof(body.ModifiedClientRequest.Body), 'string', 'the Body of the modified request is a string');

      var Body = JSON.parse(body.ModifiedClientRequest.Body);
      t.equal(Body.Env[0], 'WEAVE_CIDR=10.255.0.10/8', 'the WEAVE_CIDR env var is present');
      t.deepEqual(Body.Entrypoint, ['/home/weavewait/wait-for-weave'], 'the Entrypoint is wait-for-weave');
      t.deepEqual(Body.Cmd, [ 'bash', '/srv/app/run.sh', 'hello', 'world' ], 'the Cmd is correct');
      t.deepEqual(Body.HostConfig.VolumesFrom, [ 'weavewait:ro' ], 'The volumes from is correct')

      server.close(function(){
        t.end();
      })
    }))

    req.end(testutils.getPreHook());
    
  })
  
})

tape('Server should handle a start request', function(t){


  var server = Server({
    getImageData:testutils.getImageData,
    getContainerData:testutils.getContainerData,
    runWeaveAttach:testutils.runWeaveAttach
  })
  
  server.listen(8080, function(){

    var req = hyperquest.post('http://127.0.0.1:8080/extension')

    req.pipe(concat(function(body){

      body = JSON.parse(body.toString());

      t.equal(body.PowerstripProtocolVersion, 1, 'the PowerstripProtocolVersion is 1');
      t.equal(body.ModifiedServerResponse.Code, 204, 'the ResponseCode of the response is correct');

      server.close(function(){
        t.end();
      })
    }))

    req.end(testutils.getPostHook());
    
  })

})