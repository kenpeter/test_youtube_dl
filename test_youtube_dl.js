var youtubedl = require('youtube-dl');
var url = 'https://www.youtube.com/watch?v=umyRBliBOMY&t=503s';
// Optional arguments passed to youtube-dl.
youtubedl.getInfo(url, function(err, info) {
  if (err) throw err;

  console.log('id:', info.id);
  console.log('title:', info.title);
  console.log('url:', info.url);
  console.log('thumbnail:', info.thumbnail);
  console.log('description:', info.description);
  console.log('filename:', info._filename);
  console.log('format id:', info.format_id);
});
