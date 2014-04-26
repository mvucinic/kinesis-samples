var AWS = require('aws-sdk'),
	 uuid = require('node-uuid'),
    config = require('./config');

/*
	Assumes you have:

	1. Set your credentials as environment variables

		export AWS_ACCESS_KEY_ID='key'
		export AWS_SECRET_ACCESS_KEY='secret'

	2. Create a kinesis stream and define its name in 
	   the config file
*/

// configure
AWS.config.region = config.aws.region;
AWS.config.apiVersions = config.aws.kinesis;

// stream
var kinesis = new AWS.Kinesis();

var toBase64EncodedString = function(str){
  return new Buffer(str || '').toString('base64');
};

var sendData = function(key, obj){
	var putArgs = {
	  Data: toBase64EncodedString(obj),
	  PartitionKey: key,
	  StreamName: config.aws.stream
	};
	kinesis.putRecord(putArgs, function(err, data) {
	  if (err) console.log(err, err.stack);
	  else     console.log(data);
	});
};

var mockData = function(){
	var id = uuid.v4();
	sendData(id, { 
		'id': id, 
		'ts': new Date().getTime(), 
		'tx': 'Long message' });	
   setTimeout(mockData, 1000);
}

var stateArgs = { StreamName: config.aws.stream };
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
  	console.log('STATUS: ' + status);

  	// mock data
  	mockData();

  }
});