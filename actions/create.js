/*

  pre-hook responsible for:

   * adding weavewait to the volumes-from
   * remapping the entrypoint to be wait-for-weave
   * prepending the original entrypoint onto the arguments
  
*/

const WAIT_FOR_WEAVE_PATH = '/home/weavetools/wait-for-weave'
const WAIT_FOR_WEAVE_VOLUME = 'weavewait:ro'

module.exports = function(req, callback){
  var cmd = [req.Body.Entrypoint, req.Body.Cmd].join(' ')
  req.Body.Entrypoint = WAIT_FOR_WEAVE_PATH
  req.Body.Cmd = cmd
  req.Body.HostConfig.VolumesFrom.push(WAIT_FOR_WEAVE_VOLUME)
  callback(null, 200, req)
}
