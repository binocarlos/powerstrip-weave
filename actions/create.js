/*

  pre-hook responsible for:

   * adding weavewait to the volumes-from
   * remapping the entrypoint to be wait-for-weave
   * prepending the original entrypoint onto the arguments
  
*/
var utils = require('../utils')
var dockerclient = require('../dockerclient')

const WAIT_FOR_WEAVE_PATH = '/home/weavewait/wait-for-weave';
const WAIT_FOR_WEAVE_VOLUME = 'weavewait:ro';

module.exports = function(req, api, callback){

  var fetchImageData = api.fetchImageData;

  req.Body = JSON.parse(req.Body)

  /*
  
    first check to see if there is a WEAVE_CIDR env var

    if there is none then we dont need to mess with the create packet
    
  */
  var weaveCidr = utils.extractWeaveEnv(req.Body.Env);

  if(!weaveCidr){
    return callback(null, req)
  }

  var ImageName = req.Body.Image;

  /*
  
    grab the image info so we can combine container and image
    entrypoints / cmds
    
  */
  fetchImageData(ImageName, function(err, ImageInfo){

    if(err) return callback(err)

    ImageInfo = typeof(ImageInfo)=='string' ? JSON.parse(ImageInfo) : ImageInfo

    var ImageEntry = ImageInfo.Config.Entrypoint;
    var ImageCmd = ImageInfo.Config.Cmd;
    var ContainerEntry = req.Body.Entrypoint;
    var ContainerCmd = req.Body.Cmd;

    // remap entry point and change the cmd to a combo of image / container settings
    req.Body.Entrypoint = [WAIT_FOR_WEAVE_PATH];
    req.Body.Cmd = utils.combineEntryPoints(ImageEntry, ContainerEntry, ImageCmd, ContainerCmd);

    // inject the --volumes-from = weavewait
    if(!req.Body.HostConfig.VolumesFrom){
      req.Body.HostConfig.VolumesFrom = [];
    }

    req.Body.HostConfig.VolumesFrom.push(WAIT_FOR_WEAVE_VOLUME);    
    req.Body = JSON.stringify(req.Body)
    callback(null, req);
  })
  
}
