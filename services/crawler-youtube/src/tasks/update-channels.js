module.exports = function() {
  (async function(){
    console.log('updateChannels() START')
    let result = {}
    
    // logic
    
    console.log('updateChannels() SUCCESS', result)
  })()
  .catch(err => {
    console.log('updateChannels() ERROR', err)
  })
}