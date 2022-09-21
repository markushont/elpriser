import boto3
import json
import requests
from datetime import datetime
from decimal import Decimal

db_client = boto3.client('dynamodb')
dynamodb_resource = boto3.resource('dynamodb')

prices_query = '''{
  viewer {
    homes {
      currentSubscription{
        priceInfo{
          current{
            total
            energy
            tax
            startsAt
          }
          today {
            total
            energy
            tax
            startsAt
          }
          tomorrow {
            total
            energy
            tax
            startsAt
          }
        }
      }
    }
  }
}'''

def get_api_token(username):
    auth_data = db_client.get_item(
        TableName='electricityPricesAuth',
        Key={
            'user_name': {
                'S': username
            }
        }
    )
    
    return auth_data['Item']['api_token']['S']

def save_to_db(price_data, username):
    table = dynamodb_resource.Table('electricityPrices')
    
    with table.batch_writer() as batch:
        for item in price_data:
            starts_at = datetime.fromisoformat(item['startsAt'])
            to_save = {
                'date': str(starts_at.date()),
                'timestamp': starts_at.strftime('%H:%M:%S.%f'),
                'energy': item['energy'],
                'tax': item['tax'],
                'total': item['total'],
                'user': username
            }
            batch.put_item(
                Item=json.loads(json.dumps(to_save), parse_float=Decimal)
            )

def lambda_handler(event, context):
    username = 'markus'
    request_headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {get_api_token(username)}"
    }
    
    res = requests.post(
        'https://api.tibber.com/v1-beta/gql',
        json={'query': prices_query},
        headers=request_headers
    )
    
    if not res.ok:
      print(res.text)
      return {
        'statusCode': 500,
        'body': res.text
      }

    data = res.json()
    
    prices_today = data['data']['viewer']['homes'][0]['currentSubscription']['priceInfo']['tomorrow']

    save_to_db(prices_today, username)
    
    return {
        'statusCode': 200
    }
