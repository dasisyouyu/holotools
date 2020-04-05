/**
 * VIDEOS INFO
 * Gets full information on newly added videos
 * 
 * Logic:
  - fetch videos where:
    - status = null
    - max 50
  - ytapi video.list
    - part = snippet,liveStreamingDetails
    - fields = items(id,snippet,liveStreamingDetails)
  - update video records
 * SCHEDULE: Every 2 mins
    - [YTQUOTA] minsWithNewVids * 3cost = 150 (only on minutes when are new videos)
    - [FS:READ] 720exec * 1search = 720
    - [FS:WRITE] 720exec * numNewVideos = 50
 */

const config = require('config')
// const moment = require('moment-timezone')
const {google} = require('googleapis')
const {Firestore} = require('@google-cloud/firestore')

module.exports = function() {
  console.log('videosInfo() START');
  (async function(){

    // Initiate YouTube API
    const youtube = google.youtube({
      version: 'v3',
      auth: config.keys.google
    })

    // Initialize Firestore
    const firestore = new Firestore({ keyFilename: 'gcp-key.json' })
    
    // Look for videos without information or status
    let videoCol = firestore.collection('video')
    videoCol.where('ytVideoId', '<', '\uf8ff')
    videoCol.where('status', '==', 'new')
    videoCol.limit(50)
    let videoSch = await videoCol.get()

    // Make list of videos iterable
    let videoResults = {}
    videoSch.forEach(videoItem => {
      videoResults[videoItem.id] = videoItem.data()
    })

    // If no pending videos, 
    if (!Object.keys(videoResults).length)
      return Promise.resolve('No new videos, skipping videos.list')

    // Fetch information of all the new videos from YouTube API
    let ytResults = await youtube.videos.list({
      part: 'snippet,status',
      id: Object.values(videoResults).map(v => v.ytVideoId).join(','),
      hl: 'ja',
      fields: 'items(id,snippet(channelId,title,description,publishedAt),status(embeddable))',
      maxResults: 50
    }).catch(err => {
      console.error('videosInfo() Unable to fetch videos.list', err)
      return null
    })

    // Run through all new videos
    let videoInfos = ytResults.data.items
    for (videoInfo of videoInfos) {

      // Structure video object
      let videoObj = {
        ytVideoId: videoInfo.id,
        bbVideoId: null,
        ytChannelId: videoInfo.snippet.channelId,
        bbSpaceId: null,
        title: videoInfo.snippet.title,
        description: videoInfo.snippet.description,
        publishedAt: videoInfo.snippet.publishedAt,
        thumbnail: null,
        embeddable: videoInfo.status.embeddable,
        status: 'info',
        liveSchedule: null,
        liveStart: null,
        liveEnd: null,
        lateStream: null,
        duration: null,
      }

      // Save to firestore
      const videoKey = 'video/yt:' + videoInfo.id
      const videoRef = firestore.doc(videoKey)
      await videoRef.set(videoObj, { merge: true })
        .then(res => {
          console.log('videosInfo() Successfully saved video', videoInfo.id);
        })
        .catch(err => {
          console.error('videosInfo() Unable to save video', err)
        })
    }

    return Promise.resolve('Done.')
  })()
  .then(res => {
    console.log('videosInfo() SUCCESS %s', res || '')
  })
  .catch(err => {
    console.error('videosInfo() ERROR', err)
  })
}