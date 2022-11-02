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

def save_to_db(price_data, user):
    table = dynamodb_resource.Table('electricityPrices')
    
    with table.batch_writer() as batch:
        for item in price_data:
            starts_at = datetime.fromisoformat(item['startsAt'])
            to_save = {
                'date': f"{user['area']}:{str(starts_at.date())}",
                'timestamp': starts_at.strftime('%H:%M:%S.%f'),
                'energy': item['energy'],
                'tax': item['tax'],
                'total': item['total']
            }
            batch.put_item(
                Item=json.loads(json.dumps(to_save), parse_float=Decimal)
            )

def get_users():
    user_data = db_client.scan(
        TableName='electricityPricesAuth',
        AttributesToGet=['user_name', 'api_token', 'area'])
    
    return [{'user_name': v['user_name']['S'], 'area': v['area']['S'], 'api_token': v['api_token']['S']} for v in user_data['Items']]

def fetch_and_save_data(user):
    request_headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {user['api_token']}"
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

    save_to_db(prices_today, user)

def lambda_handler(event, context):
    users = get_users()
    
    for user in users:
      fetch_and_save_data(user)
    
    return {
        'statusCode': 200
    }
