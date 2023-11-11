import logging
import os
import json

import boto3
import openai

import utils
import llm

import pickle

logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger()

RUBRIC = pickle.load(open("assets/rubric.pickle", "rb"))
SYMPTOMS = pickle.load(open("assets/symptoms.pickle", "rb"))
DISORDERS = json.load(open('assets/disorders.json'))

def handler(event, context=None):
    request = utils.get_request(event)

    api_names = ['patient', 'therapist']
    contexts = [RUBRIC, SYMPTOMS]
    
    result = llm.get_analysis(request, api_names, contexts, model='embedding')
    return result
    