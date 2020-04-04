/**
 * VIDEOS FEED
 * Gets latest videos from each channel through YouTube XML feed
 * 
 * Logic:
  - feed xml
    - first two videoIds, save to db
    - (every 2 mins) 1440mins / 2mins * 2videoIds * numChannels
 */

const config = require('config')
const axios = require('axios')
const {Firestore} = require('@google-cloud/firestore')

const videoIdRegex = RegExp('<yt:videoId>(.*?)</yt:videoId>','gim')

module.exports = function() {
  (async function(){
    console.log('videosFeed() START')
    let result = {}

    // Initialize Firestore
    const firestore = new Firestore({ keyFilename: 'gcp-key.json' })

    // To compile list of new videoIDs to be saved
    let videoIds = []

    // Run through all channels in config
    for (channelId of config.channels) {
      // Get YouTube feed XML
      console.log('Fetching YT XML feed for', channelId);
      let fetchFeed = await axios.get('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId)
        .catch(err => {
          console.warn('Unable to fetch channel feed XML data', err)
          return null
        })
      if (!fetchFeed || !fetchFeed.data) continue

      // Extract latest two video IDs
      let channelVideos = []
      while ((match = videoIdRegex.exec(fetchFeed.data))) channelVideos.push(match[1])
      channelVideos = channelVideos.splice(0,2)
      videoIds = videoIds.concat(channelVideos)
    }

    // Insert all videos into database
    for (videoId of videoIds) {
      const videoKey = 'video/yt:' + videoId
      const videoRef = firestore.doc(videoKey)
      await videoRef.set({ ytVideoId: videoId }, { merge: true })
        .then(res => {
          console.log('Successfully saved video', videoId);
        })
        .catch(err => {
          console.error('Unable to save video', err)
        })
    }
    
    console.log('videosFeed() SUCCESS', result)
  })()
  .catch(err => {
    console.log('videosFeed() ERROR', err)
  })
}