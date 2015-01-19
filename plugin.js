var create = require('./actions/create')
var start = require('./actions/start')

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

    var response = {
      Method:req.Method,
      Request:req.Request,
      Body:req.body
    }

    /*
    
      main router
      
    */
    if(req.method=="POST"){
      if(req.Request.match(/\/container\/create$/)){
        response.Body = create(req)
      }
      else if(req.Request.match(/\/container\/\w+\/start/)){
        response.Body = start(req)
      }
    }
    
    callback(null, 200, response)
  }
}