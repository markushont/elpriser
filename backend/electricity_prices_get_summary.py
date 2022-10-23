import boto3
import json
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import datetime, timedelta
from itertools import groupby
from statistics import mean

dynamodb = boto3.resource('dynamodb')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

def get_user(username):
    user_table = dynamodb.Table('electricityPricesAuth')
    
    return user_table.get_item(
        Key={'user_name': username}
    )['Item']

def lambda_handler(event, context):
    today = datetime.now().date()
    range_start = today - timedelta(days=30)
    username = event['pathParameters']['username']
    user = get_user(username)

    summary = {
        '30_day_summary': {}
    }

    prices_table = dynamodb.Table('electricityPrices')
    prices_response = prices_table.scan(
        FilterExpression=Key('date').between(f"{user['area']}:{range_start}", f"{user['area']}:{today}")
    )
    
    for key, group in groupby(prices_response['Items'], key=lambda x: x['date']):
        date = key.split(':')[1]
        group_data = list(group)
        summary['30_day_summary'][date] = {
            'price_avg': round(mean([float(g['total']) for g in group_data]), 2)
        }
    
    summary['price_avg_daily'] = round(
        mean([
            d['price_avg']
            for date, d in summary['30_day_summary'].items()
            if 'price_avg' in d
        ]),
        2)
    
    consumption_table = dynamodb.Table('electricityConsumption')
    consumption_response = consumption_table.scan(
        FilterExpression=Key('user_date').between(f"{username}:{range_start}", f"{username}:{today}")
    )
    
    for key, group in groupby(consumption_response['Items'], key=lambda x: x['user_date']):
        date = key.split(':')[1]
        group_data = list(group)
        summary['30_day_summary'][date]['consumption_tot'] = \
            round(sum([float(g['consumption']) for g in group_data]), 2)
        summary['30_day_summary'][date]['cost_tot'] = \
            round(sum([ float(g['consumption']) * (float(g['unit_price']) + float(g['unit_price_vat'])) for g in group_data]), 2)
        summary['30_day_summary'][date]['consumption_avg'] = \
            round(mean([float(g['consumption']) for g in group_data]), 2)
    
    summary['consumption_avg_daily'] = round(
        mean(
        [
            d['consumption_avg']
            for date, d in summary['30_day_summary'].items()
            if 'consumption_avg' in d
        ]), 
        2)
    summary['cost_tot'] = round(
        sum(
        [
            d['cost_tot']
            for date, d in summary['30_day_summary'].items()
            if 'cost_tot' in d
        ]),
        2)
    
    thirty_day_list = [
        {
            'consumption_tot': d['consumption_tot'] if 'consumption_tot' in d else None,
            'consumption_avg': d['consumption_avg'] if 'consumption_avg' in d else None,
            'cost_tot': d['cost_tot'] if 'cost_tot' in d else None,
            'date': date,
            'price_avg': d['price_avg'] if 'price_avg' in d else None
        }
        for date, d in summary['30_day_summary'].items()
    ]
    
    summary_ret = {
        'price_avg_daily': summary['price_avg_daily'],
        'consumption_avg_daily': summary['consumption_avg_daily'],
        'cost_tot': summary['cost_tot'],
        '30_day_summary': list(sorted(
            thirty_day_list,
            key=lambda x: x['date']
        ))
    }
    
    return {
        'statusCode': 200,
        'headers': {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://elpriser.silberstein.se',
          'Access-Control-Allow-Headers': 'X-Requested-With, localhost'
        },
        'body': json.dumps(summary_ret, cls=DecimalEncoder)
    }