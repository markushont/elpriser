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
    table = dynamodb.Table('electricityConsumption')

    this_date = datetime.strptime(event['queryStringParameters']['date'], '%Y-%m-%d').date()
    this_date = str(this_date)

    this_username = event['pathParameters']['username']

    consumption_response = table.query(
        KeyConditionExpression=Key('user_date').eq(f"{this_username}:{this_date}"),
        ProjectionExpression=','.join([
            'from_timestamp',
            'consumption',
            'cost',
            'unit_price',
            'unit_price_vat'
        ])
    )

    consumption = {
        'consumption': [
            {
                'from_timestamp': i['from_timestamp'],
                'consumption': float(i['consumption']),
                # 'consumption_unit': i['consumption_unit'],
                'cost': float(i['cost']),
                'unit_price': float(i['unit_price']),
                'unit_price_vat': float(i['unit_price_vat'])
            }
            for i in consumption_response['Items']
        ]
    }
    
    return {
        'statusCode': 200,
        'headers': {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://elpriser.silberstein.se',
          'Access-Control-Allow-Headers': 'X-Requested-With, localhost'
        },
        'body': json.dumps(consumption, cls=DecimalEncoder)
    }
