var create = require('./actions/create')
var start = require('./actions/start')

var routes = [{
  method:'POST',
  url:/\/container\/create$/,
  type:'pre-hook',
  handler:create
},{
  method:'POST',
  url:/\/container\/\w+\/start/,
  type:'post-hook',
  handler:start
}]

/*

  this is the single endpoint that will route based on the 
  Request parameter of the JSON packet

  it can be configured with opts
  
*/

module.exports = function(opts){

  /*
  
    body is a POJO like this

    {
      Type: "pre-hook",
      Method: "POST",
      Request: "/v1.16/container/create",
      Body: { ... } or null
    }

    callback has this signature:

    callback(err, statusCode, body)
    
  */
  return function(req, callback){

    function reply(err, response){

      if(err) return callback(err)
      
      callback(null, 200, {
        PowerstripProtocolVersion: 1,
        ModifiedClientRequest: response
      })
    }

    var handler

    routes.forEach(function(route){
      if(handler) return
      if(route.method==req.ClientRequest.Method && route.type==req.Type && route.url.match(req.ClientRequest.Request)){
        handler = route.handler
      }
    })

    if(handler){
      handler(req.ClientRequest, reply)
    }
    else{
      reply(null, req.ClientRequest)
    }
  }
}