module.exports = function() {
  (async function(){
    console.log('crawlVideos() START')
    let result = {}
    
    // logic
    
    console.log('crawlVideos() SUCCESS', result)
  })()
  .catch(err => {
    console.log('crawlVideos() ERROR', err)
  })
}