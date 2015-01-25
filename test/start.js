var tape = require('tape');
var start = require('../actions/start.js');
var packet = require('./fixtures/posthook.json');
var containerData = require('./fixtures/inspect.json');

const staticContainerID = '0d1e5cf32c5ec5cb7d205292552ee7d92a862387bfbc63c8c02fd93795b4fdd0';
const staticCidr = '10.255.0.10/8';

tape('Start should expose a single function', function(t){
  t.equal(typeof(start), 'function');
  t.end();
})

tape('Start should accept a posthook request and trigger the api accordingly', function(t){

  // stub so we dont need docker
  var getContainerData = function(containerID, done){
    t.equal(containerID, staticContainerID, 'the container id is OK');
    done(null, JSON.stringify(containerData))
  }

  // stub so we dont need weave
  var runWeaveAttach = function(cidr, containerID, done){
    t.equal(cidr, staticCidr, 'the cidr is OK');
    t.equal(containerID, staticContainerID, 'the container id is OK');
    done()
  }

  start(packet.ClientRequest, {
    getContainerData:getContainerData,
    runWeaveAttach:runWeaveAttach
  }, function(err, req){
    t.deepEqual(req, {
      Body: null,
      Request: '/v1.16/containers/0d1e5cf32c5ec5cb7d205292552ee7d92a862387bfbc63c8c02fd93795b4fdd0/start',
      Method: 'POST'
    }, 'the returned packet is OK')
    t.end();
  })

  
})