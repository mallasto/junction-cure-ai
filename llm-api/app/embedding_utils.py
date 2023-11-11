from InstructorEmbedding import INSTRUCTOR
import nltk
from nltk.tokenize import sent_tokenize
import pickle
import numpy as np

# Ensure the necessary NLTK tokenizers are downloaded
nltk.download('punkt')

model = INSTRUCTOR('hkunlp/instructor-base')

def split_into_sentences(text):
    return sent_tokenize(text)

def flatten_list(lst):
    return [item for sublist in lst for item in sublist]


def embed_query(query, instruction):
    emb =  model.encode([[instruction, query]])
    emb /= np.linalg.norm(emb, axis=1, keepdims=True)
    return emb.reshape(1,-1)

# pairs = [(instruction, sentence) for sentence in split_into_sentences(entry)]
def embed_sentences(sentences, instruction):
    pairs = [[instruction, sentence] for sentence in sentences]
    emb = model.encode(pairs)
    emb /= np.linalg.norm(emb, axis=1, keepdims=True)
    return emb

def score_symptoms(entries, symptoms, top_n):
    entry_sentences = [split_into_sentences(entry) for entry in entries]
    entry_embeddings = [
        embed_sentences(
            sentences=sentences,
            instruction="Represent the Science sentence:"
        ) for sentences in entry_sentences
    ]

    results = []
    for symptom in symptoms:
        result = {
            "symptom": symptom['name'],
            "reason": "",

        }
        symptom_scores = []
        for entry_embedding in entry_embeddings:
            scores = symptom['embedding'] @ entry_embedding.T
            symptom_scores.append(scores)

        result['score'] = float(np.mean([np.mean(scores) for scores in symptom_scores]))
        max_scores = [np.max(scores) for scores in symptom_scores]

        # Get maximum scores per entries
        argmax_scores = [np.argmax(scores) for scores in symptom_scores]
        # Get their indices
        argmax_entry = np.argmax(max_scores)
        # Get the entry with maximum score
        argmax_entry_k = argmax_scores[argmax_entry]

        result['excerpts'] = {
            "entry": int(argmax_entry),
            "excerpt": entry_sentences[argmax_entry][argmax_entry_k]
        }
        results.append(result)
    
    return sorted(results, key=lambda x: x['score'])[-top_n:]
        


def score_rubric(entry, rubric, top_n=3):
    entry_sentences = split_into_sentences(entry)
    entry_embedding = embed_sentences(
        sentences=entry_sentences,
        instruction="Represent the Science sentence:"
    )

    feedbacks = []
    for item in rubric:
        scores = (item['embedding'] @ entry_embedding.T).mean(axis=0)
        argmax = np.argmax(scores)
        max_score = np.max(scores)
        feedbacks.append({
            'criteria': item['name'],
            'excerpt': entry_sentences[argmax],
            "feedback": '',
            'score': float(max_score)
        })
    return sorted(feedbacks, key=lambda fb: fb['score'])[-top_n:]
        

