import logging
import os
import json

import boto3
import openai

import utils
import llm

from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger()


SYMPTOMS = json.load(open('symptoms.json'))
DISORDERS = json.load(open('disorders.json'))

def handler(event, context=None):
    request = utils.get_request(event)

    system_message = llm.format_system_message(SYMPTOMS, 'symptoms')
    user_message = llm.format_user_message(request['entries'])
    schema = llm.get_openai_function_api('symptoms')

    logger.info(f"SYSTEM MESSAGE:\n Tokens: {utils.num_tokens_from_string(system_message)}\n{system_message}")
    logger.info(f"USER MESSAGE:\n Tokens: {utils.num_tokens_from_string(user_message)}\n{user_message}")

    result = llm.call_openai(
        user_message=user_message,
        system_message=system_message,
        schema=schema
    )
    
    return {
        'system_message': system_message,
        'user_message': user_message,
        'result': result
    }
    