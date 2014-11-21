var AWS = require('aws-sdk'),
	  uuid = require('node-uuid'),
    stdio = require('stdio'),
    os = require('os');

// command line arguments
var env = stdio.getopt({
    'region':  { key: 'r', description: 'AWS Region: [us-west-2]', default: 'us-west-2', args: 1 },
    'version': { key: 'v', description: 'API Version: [2013-12-02]', default: '2013-12-02', args: 1 },
    'stream':  { key: 's', description: 'Stream: []', default: '', args: 1 }
});

// configure
AWS.config.region = env.region;
AWS.config.apiVersions = env.version;

// stream
var kinesis = new AWS.Kinesis();
var stateArgs = {
  StreamName: env.stream
};

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

var mockData = function(){
	var id = uuid.v4();
  var load = os.loadavg();
  var msg = {
    'metric-id': id,
    'metric-ts': new Date().getTime(),
    'cpu-load-5min': load[0],
    'cpu-load-10min': load[1],
    'cpu-load-15min': load[2],
    'free-memory': os.freemem()
  };
	sendData(id, msg);
  console.dir(msg);
  setTimeout(mockData, 1000);
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

  	// mock data
  	mockData();

  }
});
