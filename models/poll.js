
var mongoose = require('mongoose');

module.exports = mongoose.model('Poll',{
	type: String,
	institution: String,
	tier: String,
	headline: String,
	short_description: String,
	long_description: String,
	link: String,
	pub_date: Date,
	vote_start: Date,
	vote_end: Date,
	positive: Number,
	negative: Number,
	abstence: Number,
	official_positive: Number,
	official_negative: Number,
    official_abstence: Number
});