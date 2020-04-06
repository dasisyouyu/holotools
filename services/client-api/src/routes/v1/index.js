const moment = require('moment-timezone');
const {Router} = require('express');
const {Firestore} = require('@google-cloud/firestore');
const Memcached = require('memcached');

// const GOOGLE_AUTH = JSON.parse(process.env.GOOGLE_SERVICE_JSON);

// Initialize Router
const router = new Router();

// Initialize Firestore
const firestore = new Firestore({
  // keyFilename: 'gcp-key.json',
  credentials: {
    client_email: GOOGLE_AUTH.client_email,
    private_key: GOOGLE_AUTH.private_key,
  },
});

// Initialize memcached
// const memcached = new Memcached(process.env.MEMCACHED_CLUSTERIP + ':11211');
// memcached.on('failure', function( details ) {
//   console.log('Cannot connect to memcached', details);
// });

router.get('/live', (req, res) => {
  (async function() {
    // Check cache
    let cacheLive = await new Promise((resolve, reject) => {
      memcached.get('live', function(err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

    console.log('cacheLive', cacheLive);
    if (cacheLive) return cacheLive;

    // Result structure
    let results = {
      live: [],
      upcoming: [],
    };

    // Look for videos without information or status
    console.log('FIRESTORE CALL');
    let videoCol = firestore.collection('video')
        .where('ytVideoId', '<', '\uf8ff')
        .where('status', 'in', ['live', 'upcoming']);
    let videoSch = await videoCol.get();

    // Get current timestamp
    let nowMoment = moment();

    // Run through all results
    videoSch.forEach((videoItem) => {
      let videoData = videoItem.data();
      if (videoData.status == 'live' || nowMoment.isSameOrAfter(moment(videoData.liveSchedule))) {
        results.live.push(videoData);
      } else if (videoData.status == 'upcoming') {
        results.upcoming.push(videoData);
      }
    });

    // Reformat live videos
    results.live = results.live.map((data) => {
      return {
        type: data.ytVideoId ? 'youtube' : 'bilibili',
        id: data.ytVideoId || data.bbVideoId,
        channel: data.ytChannelId,
        image: data.ytVideoId ? 'https://i.ytimg.com/vi/' + data.ytVideoId + '/hqdefault.jpg' : data.thumbnail,
        title: data.title,
        timeScheduled: parseInt(moment(data.liveSchedule).format('X'), 10),
        viewers: parseInt(data.liveViewers, 10),
      };
    });

    // Reformat upcoming videos
    results.upcoming = results.upcoming.map((data) => {
      return {
        type: data.ytVideoId ? 'youtube' : 'bilibili',
        id: data.ytVideoId || data.bbVideoId,
        channel: data.ytChannelId,
        image: data.ytVideoId ? 'https://i.ytimg.com/vi/' + data.ytVideoId + '/hqdefault.jpg' : data.thumbnail,
        title: data.title,
        timeScheduled: parseInt(moment(data.liveSchedule).format('X'), 10),
      };
    });

    // Save results to cache
    await new Promise((resolve, reject) => {
      memcached.set('live', JSON.stringify(results), 30, (err) => {
        if (err) reject(err);
        else resolve();
      });
    })
        .catch((err) => {
          console.error('ERR memcached.set', err);
        });

    // Result
    return results;
  })()
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(200).json({error: err.message});
      });
});

module.exports = router;
