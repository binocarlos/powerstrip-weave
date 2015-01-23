var create = require('./actions/create');
var start = require('./actions/start');

/*

  this is the single endpoint that will route based on the 
  Request parameter of the JSON packet

  it can be configured with opts
  
*/

module.exports = function(opts){

  opts = opts || {};

  var createHandler = opts.create || create
  var startHandler = opts.start || start

  var routes = [{
    method:'POST',
    url:/\/[\w\.]+\/containers\/create$/,
    type:'pre-hook',
    handler:function(req, callback){

      /*
      
        modify the create packet to inject the --volumes-from
        and remap the entrypoint
        
      */
      createHandler(req.ClientRequest, function(err, ModifiedRequest){
        callback(err, {
          PowerstripProtocolVersion: 1,
          ModifiedClientRequest: ModifiedRequest
        })
      })
    }
  },{
    method:'POST',
    url:/\/[\w\.]+\/containers\/\w+\/start/,
    type:'post-hook',
    handler:function(req, callback){

      /*
      
        tell weave to assign an IP based on the WEAVE_CIDR env
        
      */
      startHandler(req.ClientRequest, function(err){
        callback(err, {
          PowerstripProtocolVersion: 1,
          ModifiedServerResponse: req.ServerResponse
        })
      })
    }
  }];

  return function(req, callback){
    /*
    
      handler is a function that will modify the request somehow

      if no handler is found then we return the request unmolested
      
    */
    var handler, responder;

    routes.forEach(function(route){
      if(handler) return;
      var url = req.ClientRequest.Request || '';
      if(route.method==req.ClientRequest.Method && route.type==req.Type && url.match(route.url)){
        handler = route.handler;
        responder = route.responder;
      }
    })

    if(handler){
      handler(req, callback);
    }
    else{
      if(req.Type=='pre-hook'){
        callback(null, {
          PowerstripProtocolVersion: 1,
          ModifiedClientRequest: req.ClientRequest
        })
      }
      else if(req.Type=='post-hook'){
        callback(null, {
          PowerstripProtocolVersion: 1,
          ModifiedServerResponse: req.ServerResponse
        })
      }
      else{
        callback('no handler found');
      }
      
    }
  }
}