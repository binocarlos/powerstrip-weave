/*

  post-hook responsible for:

   * extracting the weave IP from the env of the container
   * calling weave to setup the network using the container id
  
*/

var async = require('async');
var hyperquest = require('hyperquest');
var utils = require('../utils');
var cp = require('child_process');
var dockerclient = require('../dockerclient');

const ADMIN_SCRIPT = '/srv/app/run.sh'

module.exports = function(req, callback){

  var containerID = utils.extractStartID(req.Request);

  /*
  
    first we need to inspect the container to see what (if any)
    instructions are inside the env regarding a weave CIDR address
    
  */
  dockerclient.container(containerID, function(err, body){
    if(err) return callback(err);
    if(!body) return callback('no response for docker container: ' + containerID);

    var containerInfo = JSON.parse(body.toString());
    var envVars = utils.extractEnvFromInspectPacket(containerInfo)
    var weaveCidr = utils.extractWeaveEnv(envVars);

    // there is no WEAVE_CIDR environment variable so just return - no weave today
    if(!weaveCidr) return callback(null, req);

    // we do this thing (right here, right now)
    // we are inside the container and so will use /srv/app/run.sh attach $cidr $containerid
    cp.exec(ADMIN_SCRIPT + ' attach ' + weaveCidr + ' ' + containerID, function(err, stdout, stderr){
      if(err) return callback(err);
      if(stderr) return callback(stderr.toString());

      // the network should be attaching itself and the wait-for-weave doing its thing!
      callback(null, req);
    })

  })
  
}