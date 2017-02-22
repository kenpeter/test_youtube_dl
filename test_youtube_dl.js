// input
var input = [
  "https://www.youtube.com/watch?v=YWZ7KtRSoAo",
  "https://www.youtube.com/watch?v=0kdbu8RZNaY"
];

// lib
var youtubedl = require('youtube-dl');

// fs
var fs = require('fs');

// ffmpeg
var ffmpeg = require('fluent-ffmpeg');

// Promise
var Promise = require("bluebird");


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
  
  // info is array
  // http://bluebirdjs.com/docs/api/promise.each.html
  Promise.each(infos, function(info) {
  
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
        downloaded = fs.statSync(video_output).size;
      }
      
      
      var video = youtubedl(
        info.webpage_url,
        ['--format=18'],
        { start: downloaded, cwd: __dirname + "/video" }
      );

      video.on('info', function(info) {
        console.log('Download started');
        console.log('filename: ' + video_output);

        var total = info.size + downloaded;
        console.log('size: ' + total);

        if (downloaded > 0) {
          console.log('resuming from: ' + downloaded);
          console.log('remaining bytes: ' + info.size);
        }
      });
      
      video.pipe(fs.createWriteStream("./video/" + video_output, { flags: 'a' }));
  
      video.on('complete', function complete(info) {
        'use strict';
        console.log('filename: ' + video_output + ' already downloaded.');
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
          console.log("----- done -----");
	        resolve();
        });

        // now run
        proc.run();
        
        /*
        proc.saveToFile("./audio/" + audio_title + ".mp3", function(stdout, stderr) {
          console.log("----- done -----");
          
          // Why I never come here??????????????????????????????????
          resolve();
        });
        */
        
      });

         
    });
    
  });
  
});










