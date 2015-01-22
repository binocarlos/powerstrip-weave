module.exports = {
  extractStartID:function(url){
    var id = url.replace(/^.*?\/containers\//, '')
    id = id.replace(/\/.*$/, '')
    return id
  }
}