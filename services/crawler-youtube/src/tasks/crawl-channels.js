/**
 * CRAWL CHANNELS
 * Update channel information and get today's stats
 * Supports newly added channel IDs on config
 * 
 * Logic:
  - get channels from config
  - channels.list
    - part = snippet,contentDetails,statistics
    - fields = nextPageToken,items(id,snippet(title,description,publishedAt,thumbnails/high/url),contentDetails/relatedPlaylists/uploads,statistics)
    - maxResults = 50
    - (every day) numPages x 6 = ?
    - if nextPageToken, repeat
 */

 const config = require('config')
 const moment = require('moment-timezone')
 const {google} = require('googleapis')
 const {Firestore} = require('@google-cloud/firestore')


module.exports = function() {
  (async function(){
    console.log('crawlChannels() START')
    let result = {}

    // Initiate YouTube API
    const youtube = google.youtube({
      version: 'v3',
      auth: config.keys.google
    })

    // Initialize Firestore
    const firestore = new Firestore({ keyFilename: 'gcp-key.json' })

    // Channel Collection
    let updatedChannelInfos = []

    // Get channels by page
    let channels = [].concat(config.channels)
    while((batch = channels.splice(0, 6)).length > 0) {
      // Fetch channel infos from YouTube API
      let ytResults = await youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        id: batch.join(','),
        fields: 'nextPageToken,items(id,snippet(title,description,publishedAt,thumbnails/high/url),contentDetails/relatedPlaylists/uploads,statistics)',
        maxResults: 50
      }).catch(err => {
        console.error('Unable to fetch channels.list', err)
        return null
      })

      // Add the results to the final collection
      ytResults.data.items.forEach(channelItem => {
        updatedChannelInfos.push({
          ytChannelId: channelItem.id,
          name: channelItem.snippet.title,
          description: channelItem.snippet.description,
          thumbnail: channelItem.snippet.thumbnails.high.url,
          publishedAt: channelItem.snippet.publishedAt,
          uploadsId: channelItem.contentDetails.relatedPlaylists.uploads,
          viewCount: channelItem.statistics.viewCount,
          subscriberCount: channelItem.statistics.subscriberCount,
        })
      })
    }

    // Save to Firestore
    for (let channelInfo of updatedChannelInfos) {
      // Save channel information
      const channelKey = 'channel/yt:' + channelInfo.ytChannelId
      const channelRef = firestore.doc(channelKey)
      // await channelRef.delete()
      await channelRef.set(channelInfo, { merge: true })
        .then(res => {
          console.log('Successfully saved document', channelKey);
        })
        .catch(err => {
          console.error('Unable to save document', err)
        })

      // Build channel's stats for today
      let today = moment().format('YYYYMMDD')
      let channelStats = {
        ytChannelId: channelInfo.ytChannelId,
        date: today,
        views: channelInfo.viewCount,
        subscribers: channelInfo.subscriberCount,
      }

      // Savbe channel statistics for the day
      const statsKey = 'channelstats/yt:' + channelInfo.ytChannelId + ':' + today
      const statsRef = firestore.doc(statsKey)
      // await statsRef.delete()
      await statsRef.set(channelStats, { merge: false }) // do not update stats if exists
        .then(res => {
          console.log('Successfully saved document', statsKey);
        })
        .catch(err => {
          console.error('Unable to save document', err)
        })
    }

    console.log('crawlChannels() SUCCESS', result)
  })()
  .catch(err => {
    console.error('crawlChannels() ERROR', err)
  })
}