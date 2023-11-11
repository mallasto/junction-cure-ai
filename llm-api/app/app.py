import logging
import os
import json

import boto3
import openai

import utils
import llm

logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger()

RUBRIC = json.load(open("assets/rubric.json"))
SYMPTOMS = json.load(open('assets/symptoms.json'))
DISORDERS = json.load(open('assets/disorders.json'))

def handler(event, context=None):
    request = utils.get_request(event)

    api_names = ['patient', 'therapist']
    contexts = [RUBRIC, SYMPTOMS]
    
    result = llm.get_analysis(request, api_names, contexts)
    return result
    