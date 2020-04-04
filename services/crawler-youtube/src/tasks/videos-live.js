/**
 * VIDEOS LIVE
 * Checks status of known live videos using heartbeat
 * This lets us know if the live has ended
 * 
 * Logic:
  - fetch videos where:
    - status = live || status = upcoming
  - live:
    - heartbeat
    - update status
  - upcoming:
    - scheduled date >= now()
    - status = live
 */

 module.exports = function() {
  (async function(){
    console.log('videosLive() START')
    let result = {}
    
    // logic
    
    console.log('videosLive() SUCCESS', result)
  })()
  .catch(err => {
    console.log('videosLive() ERROR', err)
  })
}