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
    prices_table = dynamodb.Table('electricityPrices')
    user_table = dynamodb.Table('electricityPricesAuth')

    this_date = datetime.strptime(event['queryStringParameters']['date'], '%Y-%m-%d').date()
    tomorrow_date = str(this_date + timedelta(days=1))
    this_date = str(this_date)

    this_username = event['pathParameters']['username']

    user = user_table.get_item(
        Key={'user_name': this_username}
    )
    user_area = user['Item']['area']

    today_response = prices_table.query(
        KeyConditionExpression=Key('date').eq(f"{user_area}:{this_date}")
    )
    
    tomorrow_response = prices_table.query(
        KeyConditionExpression=Key('date').eq(f"{user_area}:{tomorrow_date}")
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