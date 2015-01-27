var http = require('http')

var server = http.createServer(function(req, res){
  res.end(process.env.REMOTE_VALUE)
})

server.listen(80, function(){
  console.log('server listening on port: 80')
})