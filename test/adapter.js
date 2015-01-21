var tape = require('tape')
var Adapter = require('../adapter.js')


tape('the Adapter should expose a single function', function(t){
  t.equal(typeof(Adapter), 'function')
  t.end()
})

tape('the Adapter should not alter a GET request', function(t){

  var adapter = Adapter()

  var req = {
    PowerstripProtocolVersion: 1,
    Type: "pre-hook",
    ClientRequest: {
      Method:'GET',
      Request:'/v1.16/containers/json'
    }
  }

  adapter(req, function(err, code, response){
    t.error(err, 'there is no error')
    
    t.deepEqual(response, {
      PowerstripProtocolVersion: 1,
      ModifiedClientRequest: {
        Method:'GET',
        Request:'/v1.16/containers/json'
      }
    }, 'same packet for GET')

    t.equal(code, 200, '200 status code for GET')
    t.end()
  })

})