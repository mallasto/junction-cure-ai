import json
import embedding_utils
from tqdm import tqdm
import pickle


symptoms_path = './assets/symptoms.json'
rubric_path = './assets/rubric.json'

symptoms = json.load(open(symptoms_path))
rubric = json.load(open(rubric_path))

print('Embed symptoms')
def add_symptom_embeddings(symptoms):
    for i, symptom in tqdm(enumerate(symptoms)):
        symptom['embedding'] = embedding_utils.embed_query(
            query=symptom['description']
        )
        symptoms[i] = symptom
    return symptoms

print('Embed rubric criteria')
def add_rubric_embeddings(rubric):
    for i, element in tqdm(enumerate(rubric)):
        sentences = [f"Agrees with the criteria: {c}" for c in element['criteria']]
        element['embedding'] = embedding_utils.embed_sentences(
            sentences=sentences
        )
        rubric[i] = element
    return rubric

symptoms = add_symptom_embeddings(symptoms)
rubric = add_rubric_embeddings(rubric)

with open('assets/symptoms.pickle', 'wb') as f:
    pickle.dump(symptoms, f, protocol=pickle.HIGHEST_PROTOCOL)

with open('assets/rubric.pickle', 'wb') as f:
    pickle.dump(rubric, f, protocol=pickle.HIGHEST_PROTOCOL)