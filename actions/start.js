/*

  post-hook responsible for:

   * extracting the weave IP from the env of the container
   * calling weave to setup the network using the container id
  
*/

var async = require('async');
var utils = require('../utils');
var cp = require('child_process');

module.exports = function(req, callback){

  var containerID = utils.extractStartID(req.Request);

  /*
  
    first we need to inspect the container to see what (if any)
    instructions are inside the env regarding a weave CIDR address
    
  */
  cp.exec("docker inspect " + containerID, function(err, stdout, stderr){
    if(err) return callback(err);
    if(stderr) return callback(stderr.toString());

    var containerInfo = JSON.parse(stdout.toString());
    var weaveCidr = utils.extractWeaveEnv(containerInfo);

    // there is no WEAVE_CIDR environment variable so just return - no weave today
    if(!weaveCidr) return callback(null, req);

    // we do this thing (right here, right now)
    // we are inside the container and so will use /srv/app/run.sh attach $cidr $containerid
    cp.exec("/srv/app/run.sh attach " + weaveCidr + " " + containerID, function(err, stdout, stderr){
      if(err) return callback(err);
      if(stderr) return callback(stderr.toString());

      // the network should be attaching itself and the wait-for-weave doing its thing!
      callback(null, req);
    })

  })
  
}