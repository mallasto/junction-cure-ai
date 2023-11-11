const API = 'http://127.0.0.1:8000'
export async function postDiaryEntry(content: string) {
  return fetch(`${API}/wellness_app/entries`, {
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
  return fetch(`${API}/wellness_app/entries/all`, {
    method: 'GET',
  })
}