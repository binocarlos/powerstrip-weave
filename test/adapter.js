var tape = require('tape')
var Adapter = require('../adapter.js')


tape('the Adapter should expose a single function', function(t){
  t.equal(typeof(Adapter), 'function')
  t.end()
})

tape('the Adapter should not alter a GET request', function(t){

  var adapter = Adapter()

  var req = {
    Method:'GET',
    Request:'/containers/json'
  }

  adapter(req, function(err, code, response){
    t.error(err, 'there is no error')
    
    t.deepEqual(response, {
      Method:'GET',
      Request:'/containers/json',
      Body:undefined
    }, 'same packet for GET')

    t.equal(code, 200, '200 status code for GET')
    t.end()
  })

})