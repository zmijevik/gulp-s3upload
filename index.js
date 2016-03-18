var util = require('util');
var _path = require('path');
var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');

var AWS = require('aws-sdk');

var PluginError = gutil.PluginError;
// consts
var PLUGIN_NAME = 'gulp-s3upload';

var awsconfig = JSON.parse(fs.readFileSync('./awsconfig.json'));

AWS.config.update({
  accessKeyId: awsconfig.accessKeyId,
  secretAccessKey: awsconfig.secretAccessKey
});
var s3 = new AWS.S3();

var getType = function getType(ext) {
  if(!ext)
    return '';
  var types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript'
  };
  return types[ext] || 'text/plain';
};
// plugin level function (dealing with files)
var gulpS3Upload = function gulpS3Upload(params) {
  var options = {
    root: '.',
    bucketName: 'gulps3',
    ContentEncoding : ''
  };

  if (typeof params === 'object') {
    options = util._extend(options, params);
  }
  var getKey = function(fileInfo) {
    if (!fileInfo.ext) {
      return '';
    }

    var key = fileInfo.base,
      dir = fileInfo.dir,
      dirs = dir.split('/'),
      index = dirs.indexOf(options.root) + 1,
      i = index - dirs.length,
      x = dirs.slice(index - dirs.length);

    if (i !== 0) {
      key = x.join('/') + '/' + key;
    }

    return key;
  };

  var upload = function(stream, cb) {
    var filepath = stream['history'][0];
    var fileInfo = _path.parse(filepath);
    var key = getKey(fileInfo);
    var ext = fileInfo.ext;

    // return cb();
    if (!key) {
      return cb();
    }
    var params = {
      Bucket: options.bucketName,
      Key: key,
      ContentType: getType(ext),
      Body: stream.contents,
      ContentEncoding : options.ContentEncoding
    };

    s3.deleteObject({
        Bucket: options.bucketName,
        Key: key
      }, function(err, data) {
        if (err)
          return err;

        s3.upload(params)
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
      })
      // return cb();

  };

  var stream = through.obj(function(file, enc, cb) {
    if (file.isBuffer()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));
      return cb();
    }
    this.push(file);
    upload(file, cb);
  });
  return stream;
};

module.exports = gulpS3Upload;
