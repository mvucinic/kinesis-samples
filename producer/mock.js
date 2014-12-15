"use strict";

var AWS = require('aws-sdk'),
	  uuid = require('node-uuid'),
    stdio = require('stdio'),
    os = require('os'),
    md5 = require('MD5');

// command line arguments
var env = stdio.getopt({
    'instance': { key: 'i', description: 'Instance: [autogen]', default: uuid.v4(), args: 1 },
    'region':   { key: 'r', description: 'AWS Region: [us-west-2]', default: 'us-west-2', args: 1 },
    'version':  { key: 'v', description: 'API Version: [2013-12-02]', default: '2013-12-02', args: 1 },
    'stream':   { key: 's', description: 'Stream: []', default: '', args: 1 }
});

// configure
AWS.config.region = env.region;
AWS.config.apiVersions = env.version;

// few local variables
var srcId = '',
    i = 0,
    printOn = 500,
    delay = 1000 // in ms

// stream
var kinesis = new AWS.Kinesis();
var stateArgs = { StreamName: env.stream };

var toBase64EncodedString = function(str){
  return new Buffer(str || '').toString('base64');
};

var sendData = function(key, data){
	var putArgs = {
	  Data: data,
	  PartitionKey: key,
	  StreamName: env.stream,
    SequenceNumberForOrdering: (++i).toString()
	};
  if (i % printOn == 0) console.log('item[%d]', i);
	kinesis.putRecord(putArgs, function(err, resp) {
	  if (err) {
      console.log(err, err.stack);
    }
	});
};

var mockData = function(){
  var load = os.loadavg();
  var msg = {
    'source_id': env.instance,
    'event_id': uuid.v4(),
    'event_ts': new Date().getTime(),
    'metrics': [
      { 'key': 'cpu_load_5min', 'value': load[0] },
      { 'key': 'cpu_load_10min', 'value': load[1] },
      { 'key': 'cpu_load_15min', 'value': load[2] },
      { 'key': 'free_memory', 'value': os.freemem() }
    ]
  };
  console.dir(msg);
  var data = toBase64EncodedString(JSON.stringify(msg));
  var key = md5(data);
	sendData(key, data);
  setTimeout(mockData, delay);
}

kinesis.describeStream(stateArgs, function (err, data) {
  if (err) console.log(err, err.stack);
  else {
  	if (!data ||
  		 !data.StreamDescription ||
  		 !data.StreamDescription.StreamStatus){
  		console.log('Null status response');
  		return;
  	}
  	var status = data.StreamDescription.StreamStatus;
  	console.log('Stream status: ' + status);

    mockData();

  }
});
