
var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	name: String,
	mail: String,
	auth_type: String,
	password: String,
	image: String,
	region: String,
	city: String,
	party: String,
	delegator: String,
	tier: Number,
	count: Number
});