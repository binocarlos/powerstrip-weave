var http = require('http')
var concat = require('concat-stream')

function dockerRequest(path, done){
  var options = {
    socketPath: '/var/run/docker.sock',
    path: path,
    method: 'GET'
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(concat(function(body){
      if(body) body = body.toString()
      done(null, body, res.headers)
    }))
  });

  req.on('error', function(e) {
    done(e)
  });

  req.end();
}

module.exports = {

  /*
  
    return the JSON packet describing a container

    this is the same as `docker inspect id`
    
  */
  container:function(id, done){
    dockerRequest('/v1.16/containers/' + id + '/json', done)
  },

  /*
  
    reeturn the JSON packet describing an image

    HTTP only
    
  */
  image:function(name, done){
    dockerRequest('/v1.16/images/' + name + '/json', done)
  }
}