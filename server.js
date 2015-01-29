var http = require('http');
var concat = require('concat-stream');
var Adapter = require('./adapter');

module.exports = function(opts){

  var adapter = Adapter(opts);
  
  return http.createServer(function(req, res){

    /*
    
      slurp the request body into a JSON object
      then pass it off to the plugin to handle
      
    */
    req.pipe(concat(function(body){

      body = body.toString();

      try {
        body = JSON.parse(body);
      } catch (e) {
        res.statusCode = 200;
        res.end('');
        return;        
      }
      

      /*
      
        pass off the JSON body to the adapter which will route
        the /containers/create and /containers/:id/start handlers
        
      */
      adapter(body, function(err, body){
        if(err){
          res.statusCode = 500;
          res.end(err.toString());
        }
        else{
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          body = JSON.stringify(body);
          res.end(body);
        }
      })
    }))
  })
}