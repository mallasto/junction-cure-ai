import json
import tiktoken

def get_request(event):
    request = event.get("body")
    if request:
        request = json.loads(request)
    else:
        request = event
    return request

def num_tokens_from_string(string: str, encoding_name: str = "cl100k_base") -> int:
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens