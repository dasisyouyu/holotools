module.exports = function() {
  (async function(){
    console.log('crawlComments() START')
    let result = {}
    
    // logic
    
    console.log('crawlComments() SUCCESS', result)
  })()
  .catch(err => {
    console.log('crawlComments() ERROR', err)
  })
}