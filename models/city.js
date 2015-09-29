var mongoose = require('mongoose');

module.exports = mongoose.model('City',{
	name: String,
	logo: String,
	region: String
});