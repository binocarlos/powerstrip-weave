/*

  post-hook responsible for:

   * extracting the weave IP from the env of the container
   * calling weave to setup the network using the container id
  
*/

var utils = require('../utils');
var cp = require('child_process');

function getContainerEnv(cid, callback) {
  cp.exec("docker inspect --format='{{json .Config.Env}}' " + cid,
          function(err, stdout, stderr) {
            if (err) return callback(err);
            if (stderr && stderr.length > 0) return callback(stderr.toString());
            var env = JSON.parse(stdout.toString());
            callback(null, env);
          });
}

function runWeaveCommand(cmd, callback) {
  cp.exec("/srv/app/run.sh " + cmd, function(err, stdout, stderr){
    if(err) return callback(err);
    if(stderr) return callback(stderr.toString());
    // the network should be attaching itself and the wait-for-weave doing its thing!
    callback(null, stdout.toString());
  });
}

module.exports = function(req, callback){

  var containerID = utils.extractStartID(req.ClientRequest.Request);

  /*
  
    first we need to inspect the container to see what (if any)
    instructions are inside the env regarding a weave CIDR address
    
  */
  getContainerEnv(containerID, function(err, env) {
    if (err !== null) {
      return callback(err);
    }

    var weaveCidr = utils.extractWeaveFromEnv(env);

    // there is no WEAVE_CIDR environment variable so just return - no weave today
    if(!weaveCidr) return callback(null);

    // we do this thing (right here, right now)
    // we are inside the container and so will use /srv/app/run.sh attach $cidr $containerid

    runWeaveCommand("attach '" + weaveCidr + "' '" + containerID + "'", function(err) {
      return callback(err);
    });
  });
}
