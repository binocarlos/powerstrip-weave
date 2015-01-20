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
    
    var response = {
      Method:req.Method,
      Request:req.Request,
      Body:req.body
    }

    /*
    
      TODO: loop over the routes and match
      
    */
    callback(null, 200, response)
  }
}