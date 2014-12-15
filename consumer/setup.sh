#!/bin/bash

# wait function
wait_until()
{
    result=`eval  $* | sed 's/ //g'`
    if [[ $result == 0 ]]
    then
        echo -ne "."
        sleep 15
        wait_until $*
    else
        echo " "
    fi
}

# create a stream
echo "Creating kinesis stream: ${STREAM_NAME}"
aws kinesis create-stream --stream-name $STREAM_NAME \
                          --shard-count $SHARD_COUNT \
                          --region $REGION_NAME \
                          --profile $PROFILE_NAME

# wait for stream to be active
wait_until "aws kinesis describe-stream \
                --stream-name ${STREAM_NAME} \
                --region ${REGION_NAME} \
                --profile ${PROFILE_NAME} | grep ACTIVE | wc -l"

# capture ARN
export STREAM_ARN=$(aws kinesis describe-stream \
                            --stream-name $STREAM_NAME \
                            --region $REGION_NAME \
                            --profile $PROFILE_NAME \
                            --query 'StreamDescription.StreamARN' | tr -d '"')

echo "Stream ${STREAM_ARN} created"

# upload function
echo "Creating lambda function: ${FUNCTION_NAME}"
aws lambda upload-function --region $REGION_NAME \
                           --function-name $FUNCTION_NAME  \
                           --function-zip $FUNCTION_PATH \
                           --role "arn:aws:iam::${ACCOUNT_NUMBER}:role/${ROLE_NAME}"  \
                           --mode event \
                           --handler ProcessKinesisRecords.handler \
                           --runtime nodejs \
                           --profile $PROFILE_NAME

# capture function name
aws lambda get-function --function-name $FUNCTION_NAME \
                        --region $REGION_NAME \
                        --profile $PROFILE_NAME

# change the event source
export SOURCE_UUID=$(aws lambda add-event-source \
                            --region $REGION_NAME \
                            --function-name $FUNCTION_NAME \
                            --role "arn:aws:iam::${ACCOUNT_NUMBER}:role/${ROLE_NAME}"  \
                            --event-source $STREAM_ARN \
                            --batch-size 100 \
                            --profile $PROFILE_NAME \
                            --query "UUID" | tr -d '"')

echo "Source UUID: ${SOURCE_UUID}"

# run a quick test
echo "Putting test record"
aws kinesis put-record --stream-name $STREAM_NAME \
                       --data "SGVsbG8sIHRoaXMgaXMgYSB0ZXN0IDEyMy4=" \
                       --partition-key shardId-000000000000 \
                       --region $REGION_NAME \
                       --profile $PROFILE_NAME

echo "DONE"