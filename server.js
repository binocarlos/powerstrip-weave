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
    req.pipe(concat(function(content){
      content = content.toString();
      var request = JSON.parse(content);

      /*
      
        pass off the JSON body to the adapter which will route
        the /containers/create and /containers/:id/start handlers

        The adapter may choose not to return a response, in which case
        we pass the content back unchanged. (However, powerstrip does
        not presently deal with this case, so don't do that.)
        
      */
      adapter(request, function(err, response){
        var code;
        if (err == null) {
          code = 200;
          if(response){
            content = JSON.stringify(response);
          }
        }
        else {
          code = 500;
          content = err.toString();
        }
        res.writeHead(code, {'Content-type': 'application/json',
                             'Content-length': Buffer.byteLength(content)});
        res.end(content);
        console.log("%s %s %d", req.method,
                    request.ClientRequest.Request, code);
      })
    }))
  })
}
