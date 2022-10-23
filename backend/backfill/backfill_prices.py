from datetime import datetime, date
from decimal import Decimal
import json
import boto3

dynamodb_resource = boto3.resource('dynamodb')

def save_to_db(price_data):
    table = dynamodb_resource.Table('electricityPrices')
    
    with table.batch_writer() as batch:
        i = 0
        for item in price_data:
            if i%10 == 0:
                print(f"{i}/{len(price_data)}")
            starts_at = datetime.fromisoformat(item['startsAt'])
            to_save = {
                'date': f"SE_3:{str(starts_at.date())}",
                'timestamp': starts_at.strftime('%H:%M:%S.%f'),
                'energy': item['energy'],
                'tax': item['tax'],
                'total': item['total']
            }
            batch.put_item(
                Item=json.loads(json.dumps(to_save), parse_float=Decimal)
            )
            i=i+1


def run():
    with open('/Users/markussilbersteinhont/Downloads/prices.json', 'r') as f:
        data = json.load(f)
    
    price_data = data['data']['viewer']['homes'][0]['currentSubscription']['priceInfo']['range']['nodes']

    d = date(year=2022,month=10,day=21)

    data_points = [x for x in price_data] #if datetime.fromisoformat(x['startsAt']).date() == d]
    save_to_db(data_points)

if __name__ == '__main__':
    run()