var createdata = require('./fixtures/create.json');
var imagedata = require('./fixtures/image.json');
var containerdata = require('./fixtures/inspect.json');

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
var getImageData = function(imageName, done){
  done(null, JSON.stringify(imagedata))
}

// stub so we dont need docker
var getContainerData = function(containerID, done){
  done(null, JSON.stringify(containerdata))
}

var runWeaveAttach = function(cidr, containerID, done){
  done()
}

module.exports = {
  getImageData:getImageData,
  getCreatePacket:getCreatePacket,
  getContainerData:getContainerData,
  runWeaveAttach:runWeaveAttach
}