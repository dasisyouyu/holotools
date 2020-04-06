# Design of Holotools:

Database schema in Firestore:

Todo can we add types to this?

`channel` table:
-----
```
type:channelId { type, ytChannelId, bbSpaceId, name, description, publishedAt, thumbnail, ytUploadsId, bbRoomId }
```

```pb
yt:UCdn5BQ06XqgXoAxIhbqw5Rg { "yt", "UCdn5BQ06XqgXoAxIhbqw5Rg", null, "フブキCh。白上フブキ"...... }

bb:511613156 { "bb", null, "511613156", "朵莉丝Doris"...... }
```



`channelstats` table:
-----
```
type:channelId:YYYYMMDD { type, ytChannelId, bbSpaceId, date, views, subscribers }
```

```pb
yt:UCdn5BQ06XqgXoAxIhbqw5Rg:20200404 { "yt", "UCdn5BQ06XqgXoAxIhbqw5Rg", null, "20200404"...... }
bb:511613156:20200404 { "bb", null, "511613156", "20200404"...... }
```



`video` table:
-----

```
type:videoId { type, videoId, channelId, title, description, publishedAt, liveSchedule, liveStart, liveEnd }
```
```pb
yt: { "yt", "I2dbrbvyjyg", "UCdn5BQ06XqgXoAxIhbqw5Rg", "歌枠はちゃんと１時間やる白上フブキ"...... }
bb:BV1KE41137Ja { "bb", "BV1KE41137Ja", "511613156", "【鱼歌】朵莉丝 — 深海少女 ❤...... }
```

`videocomment` table
-----

```
type:commentId { type, videoId, videoTime, message }
```

```pb
yt:UgwzvYVMBsZGTLn0wYR4AaABAg { "yt", "I2dbrbvyjyg", "3:51", "ゆっくりとした白日" }
```