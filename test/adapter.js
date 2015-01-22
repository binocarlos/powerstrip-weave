var tape = require('tape');
var async = require('async');
var Adapter = require('../adapter.js');


tape('the Adapter should expose a single function', function(t){
  t.equal(typeof(Adapter), 'function');
  t.end();
})

tape('the Adapter should not alter a GET request', function(t){

  var adapter = Adapter();

  var req = {
    PowerstripProtocolVersion: 1,
    Type: "pre-hook",
    ClientRequest: {
      Method:'GET',
      Request:'/v1.16/containers/json'
    }
  };

  adapter(req, function(err, code, response){
    t.error(err, 'there is no error');
    
    t.deepEqual(response, {
      PowerstripProtocolVersion: 1,
      ModifiedClientRequest: {
        Method:'GET',
        Request:'/v1.16/containers/json'
      }
    }, 'same packet for GET');

    t.equal(code, 200, '200 status code for GET');
    t.end();
  })

})

tape('the Adapter should route custom create and start handlers', function(t){

  var adapter = Adapter({
    create:function(req, callback){
      req.HasSeenCreate = 'yes';
      t.equal(req.Body.fruit, 'apples', 'request body has apples');
      callback(null, req);
    },
    start:function(req, callback){
      req.HasSeenStart = 'yes';
      t.equal(req.Body.fruit, 'oranges', 'request body has oranges');
      t.equal(req.Request, '/v1.16/containers/123/start', 'request url matches');
      callback(null, req);
    }
  })

  async.series([

    /*
    
      a test for the create action
      
    */
    function(next){

      var req = {
        PowerstripProtocolVersion: 1,
        Type: "pre-hook",
        ClientRequest: {
          Method:'POST',
          Request:'/v1.16/containers/create',
          Body:{
            fruit:'apples'
          }
        }
      }

      adapter(req, function(err, code, response){
        t.error(err, 'there is no error');
        t.equal(code, 200, '200 status code for CREATE');
        t.equal(response.ModifiedClientRequest.HasSeenCreate, 'yes', 'the /containers/create route was matched');
        next();
      })
    },

    /*
    
      a test for the start action
      
    */
    function(next){
      var req = {
        PowerstripProtocolVersion: 1,
        Type: "post-hook",
        ClientRequest: {
          Method:'POST',
          Request:'/v1.16/containers/123/start',
          Body:{
            fruit:'oranges'
          }
        }
      };

      adapter(req, function(err, code, response){
        t.error(err, 'there is no error');
        t.equal(code, 200, '200 status code for START');
        t.equal(response.ModifiedClientRequest.HasSeenStart, 'yes', 'the /containers/123/start route was matched');
        next();
      })
    }
  ], function(err){
    t.error(err, 'there is no error');
    t.end();
  })


})