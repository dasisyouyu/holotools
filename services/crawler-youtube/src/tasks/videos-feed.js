/**
 * VIDEOS FEED
 * Gets latest videos from each channel through YouTube XML feed
 * 
 * Logic:
  - feed xml
    - insert all videoIds into db
 */

module.exports = function() {
  (async function(){
    console.log('videosFeed() START')
    let result = {}
    
    // logic
    
    console.log('videosFeed() SUCCESS', result)
  })()
  .catch(err => {
    console.log('videosFeed() ERROR', err)
  })
}