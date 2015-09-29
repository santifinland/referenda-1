
var mongoose = require('mongoose');

module.exports = mongoose.model('Vote',{
	poll: String,
	user: String,
	who: String,
	answer: Number,
	time: Date
});