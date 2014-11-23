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

To run the `mock.js` sample, with the instance ID and the name of your stream:

```
node mock -i 'i-001' -s 'test-events'
```

The message that will be mocked for you looks like this:

```
{ 
  source_id: 'i-001',
  event_id: 'd8cd48f9-8f24-443b-9b94-f85440537ca1',
  event_ts: 1416714164680,
  metrics: [ 
     { key: 'cpu_load_5min', value: 1.30224609375 },
     { key: 'cpu_load_10min', value: 1.28271484375 },
     { key: 'cpu_load_15min', value: 1.34912109375 },
     { key: 'free_memory', value: 4552417280 } 
  ] 
}
```

## Put

The `put` sample is pretty much the same like the mock but you can provide your own message. 

```
node put -i 'i-001' \
         -s 'test-events' \
         -m '{ "s": "test", "d": "long message here" }'
```

The message argument can be any string message, including non-JSON content.

## Arguments 

Both of the `mock` and `put` samples default to `us-west-2` region. If your stream is configured in a different region, you can define it using the `-r` argument:

```
node mock -r 'us-east-1' \
          ...
```

## About

These samples have been created by Mark Chmarny (@mchmarny)






