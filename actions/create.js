/*

  pre-hook responsible for:

   * adding weavewait to the volumes-from
   * remapping the entrypoint to be wait-for-weave
   * prepending the original entrypoint onto the arguments
  
*/

var utils = require('../utils');

const WAIT_FOR_WEAVE_PATH = '/home/weavetools/wait-for-weave';
const WAIT_FOR_WEAVE_VOLUME = 'weavewait:ro';

module.exports = function(req, callback){
  var body = JSON.parse(req.ClientRequest.Body);
  if (utils.extractWeaveFromEnv(body.Env)) {
    body.Cmd = body.Cmd || [];
    if (body.Entrypoint) body.Cmd.shift(body.Entrypoint);
    body.Entrypoint = WAIT_FOR_WEAVE_PATH;
    if(!body.HostConfig.VolumesFrom){
      body.HostConfig.VolumesFrom = [];
    }
    body.HostConfig.VolumesFrom.push(WAIT_FOR_WEAVE_VOLUME);
    req.ModifiedClientRequest = {
      Method: req.ClientRequest.Method,
      Request: req.ClientRequest.Request,
      Body: JSON.stringify(body)
    };
    return callback(null, req);
  }
  else return callback(null);
}
