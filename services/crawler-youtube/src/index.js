const config = require('config')
const schedule = require('node-schedule')

const crawlChannels = require('./tasks/crawl-channels')
const crawlVideos = require('./tasks/crawl-videos')
const videosFeed = require('./tasks/videos-feed')
const videosStatus = require('./tasks/videos-status')
const videosLive = require('./tasks/videos-live')
const crawlComments = require('./tasks/crawl-comments')

crawlChannels()

// Check livestream statuses
// schedule.scheduleJob(config.timings['check-live'], function(){
//   checkLive()
// })

// Update channel information and stats
// schedule.scheduleJob(config.timings['update-channels'], function(){
//   updateChannels()
// })

// Re-fetch list of videos
// schedule.scheduleJob(config.timings['crawl-videos'], function(){
//   crawlVideos()
// })

// Fetch comments for new videos
// schedule.scheduleJob(config.timings['crawl-comments'], function(){
//   crawlComments()
// })

console.log('RUNNING YOUTUBE CRAWLER...')