#!/usr/bin/env node

// http://www.2ality.com/2011/12/nodejs-shell-scripting.html


var VideoModel = require("./model/Video");
var UserModel = require("./model/User");

console.log("-- start to remove collections --");

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test_youtube_dl');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// https://stackoverflow.com/questions/28139638/how-can-you-remove-all-documents-from-a-collection-with-mongoose
VideoModel.remove({}, function(){
  console.log("Empty video collection");

  UserModel.remove({}, function(){
    console.log("Empty user collection");
    process.exit();
  });  
  
});




