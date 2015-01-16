var http = require('http')

var server = http.createServer(function(req, res){
  console.log('-------------------------------------------');
  console.log(req.url)
  res.end('ok')
})

server.listen(80, function(){
  console.log('server listening on port 80')
})