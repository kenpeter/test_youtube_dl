var mongoose = require('mongoose');

// http://mongoosejs.com/docs/schematypes.html
var videoSchema = mongoose.Schema({
  id: String,
  duration: String,
  fulltitle: String,
  view_count: Number,
  
  description: String,
  thumbnail: String,
  url: String,
  
  user_id: mongoose.Schema.Types.ObjectId, // schema, types obj id
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

// not export default like react
// it use module.exports
// then def schema
// then .model attached with schema
module.exports = mongoose.model("VideoModel", videoSchema);


