# kinesis-samples

A collection of AWS Kinesis samples

## Authentication 

To use these samples you will need to export to environment variables:

```
export AWS_ACCESS_KEY_ID='YOUR_AWS_KEY_KEY_HERE'
export AWS_SECRET_ACCESS_KEY='YOUR_AWS_KEY_SECRET_HERE'
```

You'll need to do this only once per console session. After that, you can execute each one of the examples many time.

> For information on how to create a `Put` only policy for Kinesis see [AWS Kinesis IAM docs](https://docs.aws.amazon.com/kinesis/latest/dev/kinesis-using-iam.html).

## Mock

The `mock` sample is a good one as it will validate the Kinesis `shard` configuration and the necessary IAM policy. The mock sample creates a message loop which send a CPU/RAM status message every second to the Kinesis endpoint. 

To run the `mock.js` sample, with the name of your stream:

```
node mock -s 'test-events'
```

The message that will be mocked for you looks like this:

```
{ 
  'src-id': 'd-84-38-35-60-b0-45',
  'metric-id': '700a16fa-a7c3-4059-aed8-69e13927bf6e',
  'metric-ts': 1416692211189, 
  'cpu-load-5min': 1.326171875,
  'cpu-load-10min': 1.328125,
  'cpu-load-15min': 1.3271484375,
  'free-memory': 2406621184 
}
```

## Put

The `put` sample is pretty much the same like the mock but you can provide your own message. 

```
node put -s 'test-events' -m '{ "s": "test", "d": "long message here" }'
```

The message argument can be any string message, including non-JSON content.

## Arguments 

Both of the `mock` and `put` samples default to `us-west-2` region. If your stream is configured in a different region, you can define it using the `-r` argument:

```
node mock -r 'us-east-1' -s 'test-events'
```

## About

These samples have been created by Mark Chmarny (@mchmarny)






