var tape = require('tape');
var Server = require('../server.js');
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
    server.close(function(){
      t.end();  
    })
  })
  
})