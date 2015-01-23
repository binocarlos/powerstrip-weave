/*

  pre-hook responsible for:

   * adding weavewait to the volumes-from
   * remapping the entrypoint to be wait-for-weave
   * prepending the original entrypoint onto the arguments
  
*/
var utils = require('../utils')

const WAIT_FOR_WEAVE_PATH = '/home/weavewait/wait-for-weave';
const WAIT_FOR_WEAVE_VOLUME = 'weavewait:ro';

module.exports = function(req, callback){

  var weaveCidr = utils.extractWeaveEnv(req.Body.Env)

  if(weaveCidr){
    var cmd = [req.Body.Entrypoint, req.Body.Cmd].join(' ');
    req.Body.Entrypoint = WAIT_FOR_WEAVE_PATH;
    req.Body.Cmd = cmd;
    if(!req.Body.HostConfig.VolumesFrom){
      req.Body.HostConfig.VolumesFrom = [];
    }
    req.Body.HostConfig.VolumesFrom.push(WAIT_FOR_WEAVE_VOLUME);
  }
  
  callback(null, req);
}
