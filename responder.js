/*

  the responder looks after the reply

  ensure the request body is a string
  
*/

module.exports = function(req, callback){

  
  if(req.Type=='pre-hook'){
    callback(null, {
      PowerstripProtocolVersion: 1,
      ModifiedClientRequest: req.ClientRequest
    })
  }
  else if(req.Type=='post-hook'){
    callback(null, {
      PowerstripProtocolVersion: 1,
      ModifiedServerResponse: req.ServerResponse
    })
  }
  else{
    callback('no handler for powerstrip type: ' + req.Type + ' found');
  }
  
}