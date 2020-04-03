module.exports = function() {
  (async function(){
    console.log('checkLive() START')
    let result = {}
    
    // logic
    
    console.log('checkLive() SUCCESS', result)
  })()
  .catch(err => {
    console.log('checkLive() ERROR', err)
  })
}