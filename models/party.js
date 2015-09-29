
var mongoose = require('mongoose');

module.exports = mongoose.model('Party',{
	name: String,
	description: String,
	logo: String,
	quota: Number,
	count: Number
});