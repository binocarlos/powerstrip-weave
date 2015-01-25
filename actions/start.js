/*

  post-hook responsible for:

   * extracting the weave IP from the env of the container
   * calling weave to setup the network using the container id
  
*/
var hyperquest = require('hyperquest');
var utils = require('../utils');

var dockerclient = require('../dockerclient');



module.exports = function(req, api, callback){

  var getContainerData = api.getContainerData;
  var runWeaveAttach = api.runWeaveAttach;

  
  var containerID = utils.extractStartID(req.Request);

  /*
  
    first we need to inspect the container to see what (if any)
    instructions are inside the env regarding a weave CIDR address
    
  */
  getContainerData(containerID, function(err, body){
    if(err) return callback(err);
    if(!body) return callback('no response for docker container: ' + containerID);

    var containerInfo = JSON.parse(body.toString());
    var envVars = utils.extractEnvFromInspectPacket(containerInfo)
    var weaveCidr = utils.extractWeaveEnv(envVars);

    // there is no WEAVE_CIDR environment variable so just return - no weave today
    if(!weaveCidr) return callback(null, req);

    // tell weave to attach the CIDR to the containerID
    runWeaveAttach(weaveCidr, containerID, function(err){
      if(err) return callback(err);
      // the network should be attaching itself and the wait-for-weave doing its thing!
      callback(null, req);
    })

  })
  
}