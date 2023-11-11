const API = 'http://127.0.0.1:8000'

export async function postDiaryEntry(content: string) {
  return fetch(`${API}/wellness_app/entries/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: content,
    }),
  })
}

export async function getEntries() {
  try {
    const response = await fetch(`${API}/wellness_app/entries/all/`);
    const data = await response.json();
    return data;
  } catch(err) {
    console.log(err);
    throw err;
  }
}

export interface EntryAPIResponse {
  entries: Entry[];
  therapist: Therapist;
}

export interface Entry {
  content: string;
  id: string;
  timestamp: string;
  patient: Patient;
}


 export interface Result {
  patient: Patient
  therapist: Therapist
}

export interface Patient {
  summary: string
  feedback: Feedback[]
}

export interface Feedback {
  criteria: string
  excerpt: string
  feedback: string
}

export interface Therapist {
  actions: string
  symptoms: Symptom[]
}

export interface Symptom {
  symptom: string
  excerpts: Excerpt[]
  reason: string
}

export interface Excerpt {
  entry: number
  excerpt: string
}
