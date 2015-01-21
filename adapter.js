var create = require('./actions/create')
var start = require('./actions/start')

/*

  this is the single endpoint that will route based on the 
  Request parameter of the JSON packet

  it can be configured with opts
  
*/

module.exports = function(opts){

  opts = opts || {}

  var routes = [{
    method:'POST',
    url:/\/[\w\.]+\/containers\/create$/,
    type:'pre-hook',
    handler:opts.create || create
  },{
    method:'POST',
    url:/\/[\w\.]+\/containers\/\w+\/start/,
    type:'post-hook',
    handler:opts.start || start
  }]

  return function(req, callback){

    function reply(err, response){

      if(err) return callback(err)
      
      callback(null, 200, {
        PowerstripProtocolVersion: 1,
        ModifiedClientRequest: response
      })
    }

    /*
    
      handler is a function that will modify the request somehow

      if no handler is found then we return the request unmolested
      
    */
    var handler

    routes.forEach(function(route){
      if(handler) return
      var url = req.ClientRequest.Request || ''
      if(route.method==req.ClientRequest.Method && route.type==req.Type && url.match(route.url)){
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