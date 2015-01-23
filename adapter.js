var create = require('./actions/create');
var start = require('./actions/start');

/*

  this is the single endpoint that will route based on the 
  Request field of the JSON packet

  it can be configured with opts
  
*/

module.exports = function(opts){

  opts = opts || {};

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
  }];

  return function(req, reply){
    /*
    
      handler is a function that will return either a modified
      request, or null meaning 'no change'. The handler can mutate the
      req safely.
      
    */
    var handler;

    routes.forEach(function(route){
      if(handler) return;
      var url = req.ClientRequest.Request || '';
      if(route.method==req.ClientRequest.Method && route.type==req.Type && url.match(route.url)){
        handler = route.handler;
      }
    })

    if(handler){
      handler(req, function(err, res) {
        if (err) reply(err);
        else if (res) {
          reply(null, res);
        }
        else {
          switch(req.Type){
          case 'pre-hook':
            req.ModifiedClientRequest = req.ClientRequest;
            break;
          case 'post-hook':
            req.ModifiedServerResponse = req.ServerResponse;
            break;
          }
          reply(null, req);
        }
      });
    }
    else{
      reply(Error("Not handled"));
    }
  }
}
