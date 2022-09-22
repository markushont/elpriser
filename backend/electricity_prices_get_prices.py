import boto3
import json
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

def lambda_handler(event, context):
    table = dynamodb.Table('electricityPrices')

    this_date = datetime.strptime(event['queryStringParameters']['date'], '%Y-%m-%d').date()
    tomorrow_date = str(this_date + timedelta(days=1))
    this_date = str(this_date)

    this_username = event['pathParameters']['username']

    today_response = table.query(
        KeyConditionExpression=Key('date').eq(f"{this_username}:{this_date}")
    )
    
    tomorrow_response = table.query(
        KeyConditionExpression=Key('date').eq(f"{this_username}:{tomorrow_date}")
    )

    prices = {
            'today': [
                {
                    'startsAt': f"{i['date'].split(':')[1]} {i['timestamp']}",
                    'total': float(i['total'])
                }
                for i in today_response['Items']
            ],
            'tomorrow': [
                {
                    'startsAt': f"{i['date'].split(':')[1]} {i['timestamp']}",
                    'total': float(i['total'])
                }
                for i in tomorrow_response['Items']
            ]
    }
    
    return {
        'statusCode': 200,
        'headers': {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://elpriser.silberstein.se',
          'Access-Control-Allow-Headers': 'X-Requested-With, localhost'
        },
        'body': json.dumps(prices, cls=DecimalEncoder)
    }