/*

  pre-hook responsible for:

   * adding weavetools to the volumes-from
   * remapping the entrypoint to be wait-for-weave
   * prepending the original entrypoint onto the arguments
  
*/

module.exports = function(req, callback){
  var cmd = [req.Body.Entrypoint, req.Body.Cmd].join(' ')
  req.Body.Entrypoint = '/home/weavetools/wait-for-weave'
  req.Body.Cmd = cmd
  req.Body.HostConfig.VolumesFrom.push('weavetools:ro')
  callback(null, 200, req)
}