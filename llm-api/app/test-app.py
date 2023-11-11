import app
import json

journals = json.load(open('../../data/journals.json'))
request = {
    'entries': journals[2]['entries'],
    'model': 'embedding'
}

result = app.handler(request)

with open(f"./result.json", 'w') as f:
    json.dump(result, f, indent=2)