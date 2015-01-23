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

  req.Body = JSON.parse(req.Body)
  var weaveCidr = utils.extractWeaveEnv(req.Body.Env)

  if(weaveCidr){

    /*
    
      convert entrypoint and cmd to arrays
      
    */
    if(req.Body.Entrypoint){
      req.Body.Entrypoint = typeof(req.Body.Entrypoint)=='string' ? [req.Body.Entrypoint] : req.Body.Entrypoint
    }
    else{
      req.Body.Entrypoint = []
    }
    if(req.Body.Cmd){
      req.Body.Cmd = typeof(req.Body.Cmd)=='string' ? [req.Body.Cmd] : req.Body.Cmd
    }
    else{
      req.Body.Cmd = []
    }

    /*
    
      the new CMD which is the old entrypoint concatenated with the cmd
      
    */
    var cmd = req.Body.Entrypoint.concat(req.Body.Cmd)

    /*
    
      the new Entrypoint which is wait for weave
      
    */
    req.Body.Entrypoint = [WAIT_FOR_WEAVE_PATH];

    req.Body.Cmd = cmd;

    /*
    
      inject the --volumes-from = weavewait
      
    */
    if(!req.Body.HostConfig.VolumesFrom){
      req.Body.HostConfig.VolumesFrom = [];
    }
    req.Body.HostConfig.VolumesFrom.push(WAIT_FOR_WEAVE_VOLUME);
  }
  
  req.Body = JSON.stringify(req.Body)
  callback(null, req);
}
