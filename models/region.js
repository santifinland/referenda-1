var mongoose = require('mongoose');

module.exports = mongoose.model('Region',{
	name: String,
	logo: String
});