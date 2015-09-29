
var mongoose = require('mongoose');

module.exports = mongoose.model('Comment',{
	user: String,
	poll: String,
	comment: String
});