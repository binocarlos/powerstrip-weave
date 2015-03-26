/*

  post-hook responsible for:

   * extracting the weave IP from the env of the container
   * calling weave to setup the network using the container id
  
*/
var hyperquest = require('hyperquest');
var utils = require('../utils');
var async = require('async');
var debug = require('debug')

var dockerclient = require('../dockerclient');

var log = debug('action:start')

module.exports = function(req, api, callback){

  var getContainerData = api.getContainerData;
  var runWeaveAttach = api.runWeaveAttach;

  
  var containerID = utils.extractStartID(req.Request);

  log('start container: %s', containerID)

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

    var attachIPs = weaveCidr.split(/\s*,\s*/)

    log('attach container: %s -> %s', containerID, weaveCidr)

    async.forEachSeries(attachIPs, function(attachIP, nextIP){
      runWeaveAttach(attachIP, containerID, nextIP)
    }, function(err){
      if(err) return callback(err)
      log('attach container done: %s -> %s', containerID, weaveCidr)
      callback(null, req)
    })

  })
  
}