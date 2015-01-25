var createdata = require('./fixtures/create.json');
var imagedata = require('./fixtures/image.json');
var containerdata = require('./fixtures/inspect.json');
var prehook = require('./fixtures/prehook.json');
var posthook = require('./fixtures/posthook.json');

// factory for a create packet
function getCreatePacket(includeWeaveENV, removeEntryPoint){
  var ret = JSON.parse(JSON.stringify(createdata));

  if(includeWeaveENV){
    ret.Env = ["WEAVE_CIDR=10.255.0.10/8"];
  }

  if(removeEntryPoint){
    ret.EntryPoint = null;
  }

  return JSON.stringify(ret);
}


// stub so we dont need docker
function getImageData(imageName, done){
  done(null, JSON.stringify(imagedata))
}

// stub so we dont need docker
function getContainerData(containerID, done){
  done(null, JSON.stringify(containerdata))
}

function runWeaveAttach(cidr, containerID, done){
  done()
}

function getPrehook(){
  var ret = JSON.stringify(prehook);
  return ret;
}

function getPosthook(){
  var ret = JSON.stringify(posthook);
  return ret;
}

module.exports = {
  getImageData:getImageData,
  getCreatePacket:getCreatePacket,
  getContainerData:getContainerData,
  getPreHook:getPrehook,
  getPostHook:getPosthook,
  runWeaveAttach:runWeaveAttach
}