"use strict";

var AWS = require('aws-sdk'),
    uuid = require('node-uuid'),
    stdio = require('stdio'),
    md5 = require('MD5');

// command line arguments
var env = stdio.getopt({
    'instance': { key: 'i', description: 'Instance: [autogen]', default: uuid.v4(), args: 1 },
    'region':   { key: 'r', description: 'AWS Region: [us-west-2]', default: 'us-west-2', args: 1 },
    'version':  { key: 'v', description: 'API Version: [2013-12-02]', default: '2013-12-02', args: 1 },
    'stream':   { key: 's', description: 'Stream: []', default: '', args: 1 },
    'message':  { key: 'm', description: 'Message: []', default: '', args: 1 }
});

// validate
if (!env.message){
  console.log('Message required');
  process.exit(1);
}

// configure
AWS.config.region = env.region;
AWS.config.apiVersions = env.version;

// stream
var kinesis = new AWS.Kinesis();
var stateArgs = { StreamName: env.stream };


var toBase64EncodedString = function(str){
  return new Buffer(str || '{}').toString('base64');
};

var sendData = function(key, data){
    var putArgs = {
      Data: data,
      PartitionKey: key,
      StreamName: env.stream
    };
    kinesis.putRecord(putArgs, function(err, resp) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log('put:')
        console.dir(putArgs);
        console.log('resp:')
        console.dir(resp);
      }
    });
};

var msg = {
  'source_id': env.instance,
  'event_id': uuid.v4(),
  'event_ts': new Date().getTime(),
  'content': env.message
}

console.log('message:');
console.dir(msg);

var msgStr = JSON.stringify(msg);
var data = toBase64EncodedString(msgStr);
var key = md5(data);
sendData(key, data);

