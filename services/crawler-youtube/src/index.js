const schedule = require('node-schedule')

const checkLive = require('./tasks/check-live')
const updateChannels = require('./tasks/update-channels')
const crawlVideos = require('./tasks/crawl-videos')
const crawlComments = require('./tasks/crawl-comments')
 
// Check livestream statuses EVERY MINUTE
schedule.scheduleJob('0 * * * * *', function(){
  checkLive()
})

// Update channel information and stats EVERY DAY
schedule.scheduleJob('0 0 0 * * *', function(){
  updateChannels()
})

// Re-fetch list of videos EVERY HOUR
schedule.scheduleJob('0 0 * * * *', function(){
  crawlVideos()
})

// Fetch comments for new videos EVERY FIVE MINUTES
schedule.scheduleJob('0 */5 * * * *', function(){
  crawlComments()
})

console.log('RUNNING YOUTUBE CRAWLER...')