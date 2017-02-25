#!/usr/bin/env node

// input
var input = [
  "https://www.youtube.com/watch?v=fhx1KkleRDI",
  "https://www.youtube.com/watch?v=TA3RsQiDFcw",
  "https://www.youtube.com/watch?v=ATR96oK6f0A",
  "https://www.youtube.com/watch?v=MIlEr8CsrQ0",
  "https://www.youtube.com/watch?v=4i7mGJ6WAZM",
];

// lib
var youtubedl = require('youtube-dl');

// fs
var fs = require('fs');

// ffmpeg
var ffmpeg = require('fluent-ffmpeg');

// Promise
var Promise = require("bluebird");

//
var VideoModel = require("./model/Video");

//
var UserModel = require("./model/User");

// mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test_youtube_dl');

// db
var db = mongoose.connection;

// error
db.on('error', console.error.bind(console, 'connection error:'));


// https://www.promisejs.org/
function youtubedl_get_info() {
  return new Promise(function (resolve, reject){
    youtubedl.getInfo(input, function(err, info) {
      if (err) {
        reject(err);
      }  
      else
      {
        //console.log(info);
        resolve(info); 
      }  
    });    
  });
}

youtubedl_get_info().then(function(infos) {
  
  // infos needs to be array
  // so need to pass 2 youtube videos.
  
  // info is array
  // http://bluebirdjs.com/docs/api/promise.each.html
  return Promise.each(infos, function(info) {
  
    // return new promise
    return new Promise(function(resolve, reject) {
      
      // output
      var video_output = info._filename.replace(/[&\/\\#,+()$~%'":*?<>{}\ ]/g, "_");
      
      var audio_title = info.title;
      audio_title = audio_title.replace(/[&\/\\#,+()$~%'":*?<>{}\ ]/g, "_");
      
      // dl zero
      var downloaded = 0;
      
      // fs file exist sync
      if (fs.existsSync(video_output)) {
        // fs state sync
        // video file
        // size
        downloaded = fs.statSync(video_output).size;
      }
      
      
      // video
      // youtube dl lib
      var video = youtubedl(
        // pass youtube url
        info.webpage_url,
        // format
        ['--format=18'],
        // start that download
        { start: downloaded, cwd: __dirname + "/video" }
      );

      // video info
      video.on('info', function(info) {
        console.log('Download started');
        console.log('filename: ' + video_output);

        // total size
        var total = info.size + downloaded;
        console.log('size: ' + total);

        if (downloaded > 0) {
          console.log('resuming from: ' + downloaded);
          console.log('remaining bytes: ' + info.size);
        }
      });
      
      // video pipe
      // fs write to it
      // flag append
      video.pipe(fs.createWriteStream("./video/" + video_output, { flags: 'a' }));
  
      // video complete
      video.on('complete', function complete(info) {
        'use strict';
        console.log('filename: ' + video_output + ' already downloaded.');
        resolve();
      });

      
      video.on('end', function() {
        console.log('Finished downloading! Start to convert to mp3');
        
        // https://stackoverflow.com/questions/42382561/how-to-resolve-this-promise-when-converting-to-mp3-is-completed-fluent-ffmpeg
        // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#savefilename-save-the-output-to-a-file
        // https://codedump.io/share/KVSJfXwwlRSI/1/nodejs--how-to-pipe---youtube-to-mp4-to-mp3
        var proc = new ffmpeg({source: "./video/" + video_output});

        // set
        proc.setFfmpegPath('/usr/bin/ffmpeg');
        
        // proc output
        proc.output("./audio/" + audio_title + ".mp3");
        
        // proc on error
        proc.on('error', function (err) {
	        console.log(err);
        });

        // end
        proc.on('end', function () {
          console.log("----- mp3 done! -----");
          
          
          // https://stackoverflow.com/questions/16882938/how-to-check-if-that-data-already-exist-in-the-database-during-update-mongoose
          UserModel.find({ userURL: info.uploader_url }, function (err, userDoc) {
            if(userDoc.length){
              console.log("User already exists");
              var userId = userDoc[0]._id;
              //console.log(userId);
              
              // now check VideoModel
              VideoModel.find({ id: info.id }, function(err, videoDoc) {
                // has video
                if(videoDoc.length) {
                  console.log("Video already exists");
                  
                  // !!!!!!!!!!!!!!!!!!!!!!!!!!!
                  resolve();
                }
                else {
                  // create new video
                  var videoObj = new VideoModel({
                    id: info.id,
                    duration: info.duration,
                    fulltitle: info.fulltitle,
                    view_count: info.view_count,
                    
                    description: info.description,
                    thumbnail: info.thumbnail,
                    url: info.url,
                    
                    user_id: userId
                  });
                  
                  // video obj save
                  videoObj.save(function(err, videoObj){
                    console.log("user and video data saved");
                    console.log();
                  
                    // !!!!!!!!!!!!!!!!!
	                  resolve();
                  });
                  
                  
                }
                
              });
              
            }
            else {
              // user obj
              var userObj = new UserModel({
                userURL: info.uploader_url
              });
              
              // save
              userObj.save(function (err, userObj) {
              
                // video obj, don't check video
                var videoObj = new VideoModel({
                  id: info.id,
                  duration: info.duration,
                  fulltitle: info.fulltitle,
                  view_count: info.view_count,
                  
                  description: info.description,
                  thumbnail: info.thumbnail,
                  url: info.url,
                  
                  user_id: userObj._id
                });
                
                // video obj save
                videoObj.save(function(err, videoObj){
                  console.log("user and video data saved");
                  console.log();
                
                  // !!!!!!!!!!!!!!!!!
	                resolve();
                })
              
              });
              
            }
               
          }); 
          
          
        });

        // now run
        proc.run();
        
        
      });

         
    });
    
  });
  
})
.then(function(){
  console.log("-- all done --");
  process.exit();
});










