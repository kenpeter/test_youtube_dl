// input
var input = "https://www.youtube.com/watch?v=0kdbu8RZNaY";

// lib
var youtubedl = require('youtube-dl');
// fs
var fs = require('fs');

var ffmpeg = require('fluent-ffmpeg');


youtubedl.getInfo(input, function(err, info) {
  if (err) throw err;

  // output
  var output = info._filename.replace(/[&\/\\#,+()$~%'":*?<>{}\ ]/g, "_");
  var file_title = info.title;
  
  // dl zero
  var downloaded = 0;

  // fs file exist sync
  // output
  if (fs.existsSync(output)) {
    // download
    // fs 
    // stat sync
    // output
    // .size
    downloaded = fs.statSync(output).size;
  }  


  // video
  // youtubedl
  // url
  // format
  // start
  // downloaded
  var video = youtubedl(input,

    // format
    // 18
    // Optional arguments passed to youtube-dl.
    ['--format=18'],

    // start, downloaded, where video should start
    // cwd, __dirname
    // start will be sent as a range header
    { start: downloaded, cwd: __dirname });

  
  // video on
  // info
  // func
  // Will be called when the download starts.
  video.on('info', function(info) {
    // start
    console.log('Download started');
    // file name
    console.log('filename: ' + output);

    // total size
    // + what ever size
    // ==== comoplete...... 
    // info.size will be the amount to download, add
    var total = info.size + downloaded;
    console.log('size: ' + total);

    // download > 0
    if (downloaded > 0) {
      // resume from.....
      // size will be the amount already downloaded
      console.log('resuming from: ' + downloaded);

      // remaining......
      // display the remaining bytes to download
      console.log('remaining bytes: ' + info.size);
    }
  });


  // video
  // pipe
  // fs
  // create write stream
  // video name
  // flag
  // append
  video.pipe(fs.createWriteStream(output, { flags: 'a' }));
  

  // video on
  // complete
  // Will be called if download was already completed and there is nothing more to download.
  video.on('complete', function complete(info) {
    'use strict';
    console.log('filename: ' + output + ' already downloaded.');
  });

  // video
  // on
  // end
  video.on('end', function() {
    console.log('finished downloading! start to convert to mp3');
    
    // https://codedump.io/share/KVSJfXwwlRSI/1/nodejs--how-to-pipe---youtube-to-mp4-to-mp3
    var proc = new ffmpeg({source: output});

    proc.setFfmpegPath('/usr/bin/ffmpeg');
    proc.saveToFile("./" + file_title + ".mp3", function(stdout, stderr) {
      console.log("done");
    });
    
  });
  
  
});












