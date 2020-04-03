const config = require('config')
const schedule = require('node-schedule')

const checkLive = require('./tasks/check-live')
const updateChannels = require('./tasks/update-channels')
const crawlVideos = require('./tasks/crawl-videos')
const crawlComments = require('./tasks/crawl-comments')
 
// Check livestream statuses
schedule.scheduleJob(config.timings['check-live'], function(){
  checkLive()
})

// Update channel information and stats
schedule.scheduleJob(config.timings['update-channels'], function(){
  updateChannels()
})

// Re-fetch list of videos
schedule.scheduleJob(config.timings['crawl-videos'], function(){
  crawlVideos()
})

// Fetch comments for new videos
schedule.scheduleJob(config.timings['crawl-comments'], function(){
  crawlComments()
})

console.log('RUNNING YOUTUBE CRAWLER...')