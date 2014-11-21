var AWS = require('aws-sdk'),
    uuid = require('node-uuid'),
    stdio = require('stdio');

// command line arguments
var env = stdio.getopt({
    'region':  { key: 'r', description: 'AWS Region: [us-west-2]', default: 'us-west-2', args: 1 },
    'version': { key: 'v', description: 'API Version: [2013-12-02]', default: '2013-12-02', args: 1 },
    'stream':  { key: 's', description: 'Stream: []', default: '', args: 1 },
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
  return new Buffer(str || '').toString('base64');
};

var sendData = function(key, obj){
    var putArgs = {
      Data: toBase64EncodedString(obj),
      PartitionKey: key,
      StreamName: env.stream
    };
    kinesis.putRecord(putArgs, function(err, data) {
      if (err) console.log(err, err.stack);
      else     console.log(data);
    });
};

sendData(uuid.v4(), {
    'on': new Date().getTime(),
    'data': env.message }
);

