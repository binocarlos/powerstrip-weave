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
  return function(body, callback){
    callback(null, 200, body)
  }
}