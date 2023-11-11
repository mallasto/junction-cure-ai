import os
import json
import asyncio
import utils
import openai

from dotenv import load_dotenv
load_dotenv()

import logging
logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger()

openai_client = openai.AsyncOpenAI(api_key=os.environ['OPENAI_API_KEY'])


async def async_call_openai(user_message, system_message, schema, model="gpt-3.5-turbo-1106", temperature=0):
    response = await openai_client.chat.completions.create(
        model=model,
        temperature=temperature,
        functions = [schema['api']],
        messages= [
        {"role": "system", "content": system_message},
        {"role": "user", "content": user_message}
        ]
    )
    print("RESPONSE:", response)
    completion = response.choices[0].message
    result = json.loads(completion.function_call.arguments)
    return result


async def get_openai_responses(input_openai):
    tasks = []

    for api_name, data in input_openai.items():

        logger.info(f"SYSTEM MESSAGE:\n Tokens: {utils.num_tokens_from_string(data['system_message'])}\n{data['system_message']}")
        logger.info(f"USER MESSAGE:\n Tokens: {utils.num_tokens_from_string(data['user_message'])}\n{data['user_message']}")

        task = async_call_openai(
            user_message=data['user_message'],
            system_message=data['system_message'],
            schema=data['schema']
        )
        tasks.append(task)

    return await asyncio.gather(*tasks)