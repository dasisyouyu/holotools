/**
 * VIDEOS STATUS
 * Checks the status of newly added videos if they're past, upcoming, or live
 * 
 * Logic:
  - fetch videos where:
    - status = null
    - max 50
  - ytapi video.list
    - part = liveStreamingDetails
    - fields = items(id,liveStreamingDetails)
    - (every 2 minutes) 1440 / 2 x 3 = 2160
  - update video records
 */

module.exports = function() {
  (async function(){
    console.log('videosStatus() START')
    let result = {}
    
    // logic
    
    console.log('videosStatus() SUCCESS', result)
  })()
  .catch(err => {
    console.log('videosStatus() ERROR', err)
  })
}