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
          id: channelItem.id,
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

    // Save updates
    for (let channelInfo of updatedChannelInfos) {
      const channelKey = 'channel/yt:' + channelInfo.id
      const channelRef = firestore.doc(channelKey)
      const channelDoc = await channelRef.get()
      // Update channel inforamtion
      if (!channelDoc.exists) {
        // Newly added channel, create
        await channelRef.create(channelInfo)
          .then(res => {
            console.log('Successfully created document', channelKey);
          })
          .catch(err => {
            console.error('Unable to create document', err)
          })
        
      } else {
        // Existing channel, update
        await channelRef.update({
          thumbnail: channelInfo.thumbnail,
          viewCount: channelInfo.viewCount,
          subscriberCount: channelInfo.subscriberCount,
        })
          .then(res => {
            console.log('Successfully updated document', channelKey);
          })
          .catch(err => {
            console.error('Unable to update document', err)
          })
      }
      // Insert statistics for the day
      const today = moment().format('YYYYMMDD')
      const statsKey = 'channelstats/yt:' + channelInfo.id + ':' + today
      const statsRef = firestore.doc(statsKey)
      const statsDoc = await statsRef.get()
      // Only create if none yet for this channel for this day
      if (!statsDoc.exists) {
        await statsRef.create({
          type: 'yt',
          ytChannelId: channelInfo.id,
          bbSpaceId: null,
          date: today,
          views: channelInfo.viewCount,
          subscribers: channelInfo.subscriberCount,
        })
          .then(res => {
            console.log('Successfully created document', statsKey);
          })
          .catch(err => {
            console.error('Unable to create document', err)
          })
      }
    }

    console.log('crawlChannels() SUCCESS', result)
  })()
  .catch(err => {
    console.log('crawlChannels() ERROR', err)
  })
}