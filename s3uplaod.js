var auth = {
	access_key: 'AKIAIIPRUKRU5XJAYX7A',
	access_secret: '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'
};

var aws = {
	accessKeyId: 'AKIAJMUH3SF7U2CFN5GQ',
	secretAccessKey: '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'
};
var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: aws.accessKeyId,
	secretAccessKey: aws.secretAccessKey
});
var s3 = new AWS.S3();

var getType = function(key) {
	var suffix = key.split('.')[1];
	var types = {
		'html' : 'text/html',
		'css' : 'text/css',
		'js' : 'text/javascript'
	};
	return types[suffix] || 'text/plain';
};

var upload = function(stream, cb) {
	var path = stream['history'][0].split('/');
	var folder = path[path.length - 2];
	// folder = (folder === 'dist') ? '' : folder + ;
	var key = path[path.length - 1];
	if(key.indexOf('.') === -1) {
		return cb();
	}
	if(folder === 'dist') {
		folder = ''
	}
	key = (folder) ? (folder + '/' + key) : key;

	var defaults = {
		Bucket: 'gulps3',
		Key: key,
		ContentType: getType(key),
		Body: stream.contents || stream
	};

	s3.upload(defaults)
		.on('httpUploadProgress', function(evt) {
			console.log('Progress:', evt.loaded, '/', evt.total);
		})
		.on('error', function(err) {
			console.log('OOPS', err);
		})
		.send(function(err, data) {
			if (err) {
				console.log(err);
			}
			cb();
		});
};


module.exports = upload;
