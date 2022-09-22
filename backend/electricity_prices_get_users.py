import boto3
import json

db_client = boto3.client('dynamodb')

def get_users():
    user_data = db_client.scan(
        TableName='electricityPricesAuth',
        AttributesToGet=['user_name'])
    
    return {'users':[v['user_name']['S'] for v in user_data['Items']]}

def lambda_handler(event, context):
    
    users = get_users()
    
    return {
        'statusCode': 200,
        'headers': {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://elpriser.silberstein.se',
          'Access-Control-Allow-Headers': 'X-Requested-With, localhost'
        },
        'body': json.dumps(users)
    }
