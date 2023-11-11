import app
import json

journals = json.load(open('../../data/journals.json'))
request = {
    'api_name': 'user_feedback',
    'entries': journals[0]['entries']
}

result = app.handler(request)

with open(f"./result-{request['api_name']}.json", 'w') as f:
    json.dump(result, f, indent=2)