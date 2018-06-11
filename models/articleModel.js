var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  comment: {
    type: String,
    required: true,
    trim: true
  },
  created: {
    type: Date,
    default: Date.now,
  },
})

var ArticleSchema = new Schema({
  headline: {
    type: String,
    trim: true,
    required: "String is Required"
  },
  uri: {
    type: String,
    trim: true,
    required: "String is Required"
  },
  summary: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  comments: [CommentSchema]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
