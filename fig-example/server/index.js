var http = require('http')
var concat = require('concat-stream')
var hyperquest = require('hyperquest')

var serverIP = process.env.API_IP;
var serverPort = 80;

var server = http.createServer(function(req, res){
  var req = hyperquest('http://' + serverIP + ':' + serverPort).pipe(concat(function(body){
    body = body.toString()

    res.end('Value from the other server: ' + body)
  }))

  req.on('error', function(err){
    res.statusCode = 500
    res.end(err)
  })
})

server.listen(80, function(){
  console.log('server listening on port: 80')
})