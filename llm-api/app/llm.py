import os
import json
import yaml

from typing import List
from pydantic import BaseModel, Field
import asyncio

import openai_utils
import embedding_utils
import utils

from dotenv import load_dotenv
load_dotenv()

def format_context_string(context, api_name):
    res = ""

    # THERAPIST
    if api_name == 'therapist':
        for c in context:
            res += f"{c['name']}: {c['description']}\n"

    # PATIENT
    elif api_name == 'patient':
        for c in context:
            res += f"### {c['name']}\n"
            
            res += f"Criteria:\n"
            for criteria in c['criteria']:
                res += f"\t{criteria}\n"

            res += f"Examples:\n"
            for example in c['examples']:
                res += f"\t{example}\n"
            res += "\n"
    return res

def format_system_message(input_str, api_name):
    if api_name == "therapist":
        return f""" ## ROLE:You are an assistant to a therapist. 
## TASK: Your task is to read through entries from a patient's therapy journal.
Below, you are provided with a list of symps of mental disorders and their descriptions. You should
respond with any symptoms matching with the journal.

## RESPONSE: Your response should contain per symptom matched:
    - Name of the symptom expressed in the journal entry.
    - List of excerpts from the journal entry that you associate with a given symptom.
    - Reason for why the symptom can be concluded from the excerpts.
Please also describe what the user has been doing according to the journal.

## SYMPTOMS AND THEIR DESCRIPTIONS:
{input_str}
"""
    elif api_name == "patient":
        return f""" ## ROLE:You are antropomorphic labradoodle working as a therapist's assistant to support people writing their therapy journals.
You are happy, optimistic, understanding and caring. A perfect therapy dog! 
## TASK: Your task is to read through a patient's therapy journal and provided feedback based on the rubric below.
Provide feedback only if there is especially insightful parts in the journal. No need to provide the feedback on
all criteria, only the ones you think are worth highlighting.

## RESPONSE: For each of the criteria you choose, you should return:
    - Name of the criteria.
    - Exact excerpt from the journal entry that the feedback relates to.
    - The feedback, please be encouraging and understanding.
Please also provide a summary of all the feedback.

## RUBRIC:
{input_str}
"""


def format_user_message(entries, api_name):
    journal_str = ""
    
    # THERAPIST
    if api_name == 'therapist':
        for i, entry in enumerate(entries):
            journal_str += f"Entry {i}: {entry}\n\n"
        return f""" ## THERAPY JOURNAL:
        {journal_str}
        """
    # PATIENT
    elif api_name == 'patient':
        return f" ## THERAPY JOURNAL:\n {entries[-1]}"

def get_openai_function_api(api_name):
    schema = None

    # THERAPIST
    if api_name == "therapist":
        class ExcerptModel(BaseModel):
            "Output Schema for excerpts"

            entry: int = Field(..., description="Entry index where the excerpt can be found")
            excerpt: str = Field(..., description="Exact excerpt from the journal entry that you associate with a given symptom")

        class SymptomModel(BaseModel):
            "Output Schema for symptoms"

            symptom: str = Field(..., description="Name of the symptom expressed in the journal entry")
            excerpts: List[ExcerptModel]
            reason: str = Field(..., description="Reason for why the symptom can be concluded from the excerpts")

        class QueryModel(BaseModel):
            "Output Schema for matching journal excerpts to symptoms.."

            actions: str = Field(..., description="Summary of what the patient has been doing. At most 100 words.")
            symptoms: List[SymptomModel]

        output_schema = QueryModel.schema()
        output_api = {
            "name": output_schema["title"],
            "description": output_schema["description"],
            "parameters": output_schema
        }
        schema = {
            'model': QueryModel,
            'api': output_api
        }

    # PATIENT
    elif api_name == "patient":
        class FeedbackModel(BaseModel):
            "Output Schema for excerpts"

            criteria: str = Field(..., description="Name of the criteria for this feedback.")
            excerpt: str = Field(..., description="Exact excerpt from the journal entry that you provide feedback to.")
            feedback: str = Field(..., description="Feedback on the specific criteria. At most 20 words.")

        class QueryModel(BaseModel):
            "Output Schema for writing feedback for therapy journals"

            feedback: List[FeedbackModel]
            summary: str = Field(..., description="A positive and encouraging summary of the provided feedback. At most 20 words.")

        output_schema = QueryModel.schema()
        output_api = {
            "name": output_schema["title"],
            "description": output_schema["description"],
            "parameters": output_schema
        }
        schema = {
            'model': QueryModel,
            'api': output_api
        }

    return schema

def get_analysis(request, api_names, contexts, model='openai'):
    if model == 'embedding':
        results = {}
        for context, api_name in zip(contexts, api_names):
            if api_name == 'patient':
                results[api_name] =  embedding_utils.score_rubric(request['entries'][-1], context, top_n=3)
            elif api_name == 'therapist':
                results[api_name] =  embedding_utils.score_symptoms(request['entries'], context, top_n=3)
        return results
    else:
        input_openai = {api_name: {} for api_name in api_names}
        for context, api_name in zip(contexts, api_names):
            context_str = format_context_string(context, api_name)
            system_message = format_system_message(context_str, api_name)
            user_message = format_user_message(request['entries'], api_name)
            schema = get_openai_function_api(api_name)

            input_openai[api_name]['system_message'] = system_message
            input_openai[api_name]['user_message'] = user_message
            input_openai[api_name]['schema'] = schema

        coroutines = openai_utils.get_openai_responses(input_openai)
        loop = asyncio.get_event_loop()
        results =  loop.run_until_complete(coroutines)
        return {f"{api_name}": result for api_name, result in zip(api_names, results)}