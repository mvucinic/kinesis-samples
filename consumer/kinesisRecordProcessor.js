
console.log('Loading event...');
exports.handler = function(event, context) {
   console.log(JSON.stringify(event, null, '  '));
   for(i = 0; i < event.Records.length; ++i) {
      encodedPayload = event.Records[i].kinesis.data;
      console.log("Raw Payload: " + encodedPayload);
      payload = new Buffer(encodedPayload, 'base64').toString('ascii');
      console.log("Decoded Payload: " + payload);
   }
   context.done(null, "Done");
};