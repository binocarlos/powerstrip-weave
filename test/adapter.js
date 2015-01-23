var tape = require('tape');
var async = require('async');
var Adapter = require('../adapter.js');
var imagedata = require('./fixtures/image.json');

tape('the Adapter should expose a single function', function(t){
  t.equal(typeof(Adapter), 'function');
  t.end();
})

tape('the Adapter should not alter a GET request pre-hook', function(t){

  var adapter = Adapter({
    getImageData:function(imageName, done){
      done(null, imagedata)
    }
  });

  var req = {
    PowerstripProtocolVersion: 1,
    Type: "pre-hook",
    ClientRequest: {
      Method:'GET',
      Request:'/v1.16/containers/json'
    }
  };

  adapter(req, function(err, response){
    t.error(err, 'there is no error');
    
    t.deepEqual(response, {
      PowerstripProtocolVersion: 1,
      ModifiedClientRequest: {
        Method:'GET',
        Request:'/v1.16/containers/json'
      }
    }, 'same packet for GET');

    t.end();
  })

})

tape('the Adapter should route custom create and start handlers', function(t){

  var seen = {}
  var adapter = Adapter({
    getImageData:function(imageName, done){
      done(null, imagedata)
    },
    create:function(req, fetchImageData, callback){
      seen.HasSeenCreate = 'yes';
      t.equal(req.Body.fruit, 'apples', 'request body has apples');
      callback(null, req);
    },
    start:function(req, callback){
      seen.HasSeenStart = 'yes';
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

      adapter(req, function(err, response){
        t.error(err, 'there is no error');
        t.equal(seen.HasSeenCreate, 'yes', 'the /containers/create route was matched');
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
        },
        ServerResponse:{
          apples:10
        }
      };

      adapter(req, function(err, response){
        t.error(err, 'there is no error');
        t.equal(seen.HasSeenStart, 'yes', 'the /containers/123/start route was matched');
        next();
      })
    }
  ], function(err){
    t.error(err, 'there is no error');
    t.end();
  })


})