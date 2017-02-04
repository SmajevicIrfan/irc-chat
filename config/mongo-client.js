var mongoose = require('mongoose');
var mongoURL = process.env.mongodbURI || "mongodb://127.0.0.1:27017/chat-data";
var mongoOptions = { };

mongoose.connect(mongoURL, mongoOptions, function(err, res) {
	if (err) {
		console.log('Connection refused to: ' + mongoURL);
		console.log(err);
	}
	else {
		console.log('Connection successful to: ' + mongoURL);
	}
});
