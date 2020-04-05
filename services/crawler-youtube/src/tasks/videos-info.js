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
    - (every minute) minsWithNew x 5cost = ? (only on minutes when are new videos)
  - update video records
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
      fields: 'items(id,snippet(channelId,title,description,publishedAt),status(uploadStatus,embeddable))',
      maxResults: 50
    }).catch(err => {
      console.error('videosInfo() Unable to fetch videos.list', err)
      return null
    })

    // Get a moment object with current time
    // let nowMoment = moment()

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

      // Video livestream status
      // if (videoInfo.liveStreamingDetails) {
      //   videoObj.liveSchedule = videoInfo.liveStreamingDetails.scheduledStartTime || null
      //   videoObj.liveStart = videoInfo.liveStreamingDetails.actualStartTime || null
      //   videoObj.liveEnd  = videoInfo.liveStreamingDetails.actualEndTime || null
      //   let scheduleMoment = moment(videoObj.liveSchedule)
      //   let startMoment = moment(videoObj.liveStart)
      //   let endMoment = moment(videoObj.liveEnd)
      //   // Determine video status
      //   if (videoObj.liveEnd) {
      //     videoObj.status = 'past'
      //   } else if (videoObj.liveStart) {
      //     videoObj.status = 'live'
      //   } else if (nowMoment.isSameOrAfter(scheduleMoment)) {
      //     videoObj.status = 'live' // waiting = not yet started, but scheduled will be considered live
      //   } else {
      //     videoObj.status = 'upcoming'
      //   }
      //   // Calculate other data
      //   if (videoObj.liveEnd)
      //     videoObj.duration = moment.duration(startMoment.diff(endMoment)).as('seconds')
      //   if (videoObj.liveStart)
      //     videoObj.lateStream = moment.duration(scheduleMoment.diff(startMoment)).as('seconds')
      // } else {
      //   // Not a live stream, uploaded vide
      //   if (videoInfo.status.uploadStatus == 'processed') {
      //     videoObj.status = 'uploaded'
      //   } else {
      //     videoObj.status = 'unknown'
      //   }
      // }

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