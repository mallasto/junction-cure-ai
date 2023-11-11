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


export async function deleteEntry(id: string) {
  return fetch(`${API}/wellness_app/entries/delete/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
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
}

export interface Entry {
  content: string;
  id: string;
  timestamp: string;
  patient_summary: string
  patient_feedback: PatientFeedback[];
  'patient feedback'?: PatientFeedback[];
  'patient summary'?: string;
  'therapist feedback'?: TherapistFeedback[];
  'therapist summary'?: string;
  therapist_summary: string
  therapist_feedback: TherapistFeedback[]
}

export interface PatientFeedback {
  feedback: string
  criteria: string
  excerpt: string
}

export interface TherapistFeedback {
  reason: string
  symptom: string
  excerpts: Excerpt[]
}

export interface Excerpt {
  entry: number
  excerpt: string
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

export interface TherapistR {
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
