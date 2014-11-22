var AWS = require('aws-sdk'),
	  uuid = require('node-uuid'),
    mac = require('getmac'),
    stdio = require('stdio'),
    os = require('os'),
    md5 = require('MD5');

// command line arguments
var env = stdio.getopt({
    'region':  { key: 'r', description: 'AWS Region: [us-west-2]', default: 'us-west-2', args: 1 },
    'version': { key: 'v', description: 'API Version: [2013-12-02]', default: '2013-12-02', args: 1 },
    'stream':  { key: 's', description: 'Stream: []', default: '', args: 1 }
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
var stateArgs = {
  StreamName: env.stream
};

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
    'src-id': srcId,
    'metric-id': uuid.v4(),
    'metric-ts': new Date().getTime(),
    'cpu-load-5min': load[0],
    'cpu-load-10min': load[1],
    'cpu-load-15min': load[2],
    'free-memory': os.freemem()
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

    mac.getMac(function(err, macAddress){
        if (err) {
          throw err;
        }else{
          // little format on the mac address
          srcId = 'd-' + macAddress.replace(/:/g, '-');
          // start
          mockData();
        }
    });
  }
});
