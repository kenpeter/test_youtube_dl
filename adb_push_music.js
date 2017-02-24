#!/usr/bin/env node

// https://stackoverflow.com/questions/16364748/must-do-adb-kill-server-and-start-server-everytime-to-recognize-android-device-i

var glob = require("glob");
var fs = require('fs');
var randomstring = require("randomstring");

var exec = require('child_process').exec;

function puts(error, stdout, stderr) { 
  console.log(stdout) 
}

// kill adb
exec("adb kill-server", puts);

// start adb
exec("adb start-server", puts);

//
console.log("\nwait for 8s\n");

var audio_path = "/var/www/html/test/testme/test_youtube_dl/audio";

// https://stackoverflow.com/questions/32604656/what-is-the-glob-character
setTimeout(
  function() {
    glob(audio_path + "/**/*.mp3", function (er, files) {

      files.map(function(singleFile){
        var arr = singleFile.split("/");
        var lastElement = arr[arr.length - 1];
        // https://stackoverflow.com/questions/441018/replacing-spaces-with-underscores-in-javascript
        // https://stackoverflow.com/questions/9705194/replace-special-characters-in-a-string-with-underscore
        var tmpFileName = lastElement.replace(/[&\/\\#,+()$~%'":*?<>{}\ ]/g, "_");
        
        //var tmpFileName = randomstring.generate(7);
      
        //https://stackoverflow.com/questions/22504566/renaming-files-using-node-js
        var tmpFullFile = audio_path + "/"+ tmpFileName;
        fs.rename(singleFile, tmpFullFile, function(err) {
          if ( err ) console.log('ERROR: ' + err);
          
          var cmd = "adb push" + " " + tmpFullFile + " " + "/sdcard/Music";
          console.log(cmd);
          exec(cmd, puts);
        });
        
      }); // end files.map
      
    }); // end glob
  }, 
  8000
);

