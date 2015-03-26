/*

  pre-hook responsible for:

   * adding weavewait to the volumes-from
   * remapping the entrypoint to be wait-for-weave
   * prepending the original entrypoint onto the arguments
  
*/
var utils = require('../utils')
var dockerclient = require('../dockerclient')
var debug = require('debug')
const WAIT_FOR_WEAVE_PATH = '/home/weavewait/wait-for-weave';
const WAIT_FOR_WEAVE_VOLUME = 'weavewait:ro';

var log = debug('action:create')

module.exports = function(req, api, callback){

  var getImageData = api.getImageData;

  req.Body = JSON.parse(req.Body);


  /*
  
    first check to see if there is a WEAVE_CIDR env var

    if there is none then we dont need to mess with the create packet
    
  */
  var weaveCidr = utils.extractWeaveEnv(req.Body.Env);

  if(!weaveCidr){
    req.Body = JSON.stringify(req.Body)
    return callback(null, req)
  }

  var ImageName = req.Body.Image;

  log('create request')
  log(JSON.stringify(req.Body, null, 4))
  log('CIDR: %s', weaveCidr)
  log('Image: %s', ImageName)

  /*
  
    grab the image info so we can combine container and image
    entrypoints / cmds
    
  */
  getImageData(ImageName, function(err, body, headers){

    if(err) return callback(err)

    // this is where the image was not found and the response is plain text
    if(headers['content-type'] && headers['content-type'].indexOf('text/plain') === 0){
      req.Body = JSON.stringify(req.Body)
      callback(null, req);
      return
    }

    var ImageInfo = JSON.parse(body);

    log('Image response: %s', ImageName)
    log(JSON.stringify(ImageInfo, null, 4))

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

    log('Changed container: %s', ImageName)
    log(JSON.stringify(req.Body, null, 4))

    req.Body = JSON.stringify(req.Body)

    callback(null, req);
  })
  
}
