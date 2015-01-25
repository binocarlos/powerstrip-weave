var create = require('./actions/create');
var start = require('./actions/start');
var responder = require('./responder');
var dockerclient = require('./dockerclient')
var utils = require('./utils')

/*

  this is the single endpoint that will route based on the 
  Request parameter of the JSON packet

  it can be configured with opts
  
*/

module.exports = function(opts){

  opts = opts || {};

  // the two handlers for create & start actions
  // overriden for the unit tests
  var createHandler = opts.create || create;
  var startHandler = opts.start || start;
  // a do nothing handler for all other requests
  var noopHandler = function(req, callback){
    callback(null, req)
  }

  // the function used to fetch image data - overridden for the unit tests
  var getImageData = opts.getImageData || dockerclient.image;

  // the function used to fetch container data - overridden for the unit tests
  var getContainerData = opts.getContainerData || dockerclient.container;

  // the function used to ask weave to attach a container to a CIDR - overriden for the unit tests
  var runWeaveAttach = opts.runWeaveAttach || utils.runWeaveAttach;

  // the router array - enables us to match handlers to incoming requests
  var routes = [{
    method:'POST',
    url:/\/[\w\.]+\/containers\/create$/,
    type:'pre-hook',
    /*
    
      CREATE action
      pass the ClientRequest so the action ignores the powerstrip layer of the JSON packet
      the create action changes the ClientRequest and so we re-assign the modified ClientRequest
      
    */
    handler:function(req, callback){
      createHandler(req.ClientRequest, {
        getImageData:getImageData
      }, function(err, ModifiedRequest){
        if(err) return callback(err)
        req.ClientRequest = ModifiedRequest;
        callback(null, req);
      })
    }
  },{
    method:'POST',
    url:/\/[\w\.]+\/containers\/\w+\/start/,
    type:'post-hook',
    /*
    
      START action
      pass the ClientRequest so the action ignores the powerstrip layer of the JSON packet
      the start action does not change anything it just reads the container id and ENV 
      
    */
    handler:function(req, callback){
      startHandler(req.ClientRequest, {
        getContainerData:getContainerData,
        runWeaveAttach:runWeaveAttach
      }, function(err){
        if(err) return callback(err)
        callback(null, req)
      })
    }
  }];

  return function(req, callback){

    // loop over the registered routes to find a handler for this request
    var handler;
    routes.forEach(function(route){
      if(handler) return;
      var url = req.ClientRequest.Request || '';
      if(route.method==req.ClientRequest.Method && route.type==req.Type && url.match(route.url)){
        handler = route.handler;
      }
    })

    // if no handler is found then we return the request unmolested
    handler = handler || noopHandler;

    handler(req, function(err, req){
      if(err) return callback(err);

      // pass off to the responder which knows how to format the powerstrip response body
      responder(req, callback)
    })
  }
}