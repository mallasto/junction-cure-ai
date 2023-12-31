## LLM Application for Patient and Therapist Insights
This application provides insights on therapy journals.
* For patients, we provide feedback on their journal entries, focusing on encouraging them on their journey.
* For therapists, we summarize the journal and find evidence in the entries for possible symptoms expressed by the patient.

### Input
The application is invoked with the following schema:
```python
{
    'entries': List[str], # List of journal entries
}
```
see `test-app.py` for an example.


### Models
We have two different models running analysis on the entries:

* `LLM` based on OpenAI GPT-3.5-turbo
* `Embedding` based on [Instructor](https://huggingface.co/hkunlp/instructor-base) embedding models and vector retrieval.


### Insights for Patients
We analyse the entries for the user by cross-referencing the entries against a `GPT4` generated rubric at `assets/rubric.json`. Based on the rubric, we provide encouraging feedback on each of the user entries. The feedback consists of

* Rubric criteria (e.g., `Growth and Progress`)
* Excerpt from the user entry, to which the feedback applies (so that we can ground our feedback directly to the user entries)
* Feedback (only with the `LLM` model)

### Insights for Therapists
For the therapist, we have `GPT4` generated lists of 
* `assets/symptoms.sjon` symptoms of mental health disorders and their descriptions
* `assets/disorders.json` mental health disorders and their associated symptoms.

We cross-reference the symptom descriptions against all user entries. If a symptom is found, we return

* Name of the symptom (e.g., `Apathy`)
* Reasons supporting the presence of the symptom (only with the `LLM` model)
* List of excerpts from the entries related to the symptom

### Output
The application responds with the following schema:
```python
{
    'patient': {
        'summary': str, # Feedback summary
        'feedback': List[
            {
                'criteria': str, # Criteria applied for this feedback
                'excerpt': str, # Excerpt from the entry to which the feedback applies
                'feedback': str # Feedback

            }
        ]
    },
    'therapist': {
        'actions': str, # Summary of the actions taken by the user described in the journal
        'symptoms': List[
            {
                'symptom': str, # Name of symptom
                'reason': str, # What supports the presence of the symptom?
                'excerpts': List[
                    {
                        'entry': int, # Index of entry containing the excerpt
                        'excerpt': str # Excerpt from the entry supporting the presence of the symptom
                    }
                ]
            }
        ]
    }
}
```