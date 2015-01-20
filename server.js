var http = require('http')
var concat = require('concat-stream')
var Adapter = require('./adapter')

module.exports = function(opts){

  var adapter = Adapter(opts)
  
  return http.createServer(function(req, res){

    /*
    
      slurp the request body into a JSON object
      then pass it off to the plugin to handle
      
    */
    req.pipe(concat(function(body){
      body = body.toString()
      adapter(JSON.parse(body), function(err, code, body){
        res.statusCode = code
        if(code==200 && body){
          res.headers['Content-type'] = 'application/json'
          body = JSON.stringify(body)
        }
        res.end(body)
      })
    }))
  })
}