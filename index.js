var args = require('minimist')(process.argv, {
  alias:{
    p:'port'
  },
  default:{
    port:80
  }
});
var Server = require('./server');
var server = Server(args);
server.listen(args.port, function(){
  console.log('server listening on port: ' + args.port);
})
