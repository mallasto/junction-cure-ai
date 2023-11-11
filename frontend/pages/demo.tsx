import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { postDiaryEntry, getEntries, Entry, Patient, Therapist } from '../pages/api/entry';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const mockPatientFeedback: Patient = {
  "summary": "You're doing a great job of reflecting on your emotions and recognizing the need for reaching out for help. Keep exploring your feelings and consider taking small steps towards seeking support.",
  "feedback": [
    {
      "criteria": "Emotional Awareness and Expression",
      "excerpt": "Spent the night at home, feeling a bit lonely.",
      "feedback": "It's great to see you expressing your feelings of loneliness. Acknowledging these emotions is an important step in understanding and addressing them."
    },
    {
      "criteria": "Self-Reflection and Insight",
      "excerpt": "I keep telling myself I\u2019ll reach out for help, talk to someone about how I\u2019ve been feeling, but I keep putting it off.",
      "feedback": "Your insight into the need for reaching out for help is commendable. It's okay to take small steps, and acknowledging the need for support is a positive move towards self-care."
    },
    {
      "criteria": "Overall Engagement and Effort",
      "excerpt": "Maybe next week will be better.",
      "feedback": "Your dedication to journaling and the hope for a better week ahead is admirable. Keep engaging with the process and remember that each entry is a step towards self-discovery and growth."
    }
  ]
}

const mockTherapistFeedback: Therapist =  {
  "actions": "The patient has been experiencing a persistent sense of feeling overwhelmed, low energy, difficulty concentrating, and a lack of appetite. They have also been avoiding social interactions and feeling disconnected from others. The patient has been struggling with negative thoughts and has been putting off seeking help.",
  "symptoms": [
    {
      "symptom": "Apathy",
      "excerpts": [
        {
          "entry": 4,
          "excerpt": "A"
        },
        {
          "entry": 1,
          "excerpt": "A"
        },
        {
          "entry": 2,
          "excerpt": "A"
        },
        {
          "entry": 3,
          "excerpt": "A"
        }
      ],
      "reason": "The patient expresses a lack of interest, enthusiasm, or concern about things that others find moving or exciting, as evidenced by feeling overwhelmed, having difficulty concentrating, and feeling disconnected from others."
    },
    {
      "symptom": "Changes in Appetite",
      "excerpts": [
        {
          "entry": 2,
          "excerpt": "C"
        }
      ],
      "reason": "The patient experiences a significant fluctuation in eating habits, as evidenced by not having much appetite despite making dinner."
    },
    {
      "symptom": "Difficulty Concentrating",
      "excerpts": [
        {
          "entry": 1,
          "excerpt": "D"
        },
        {
          "entry": 3,
          "excerpt": "D"
        }
      ],
      "reason": "The patient struggles to focus on tasks or maintain attention, as evidenced by finding it hard to concentrate and being unable to focus while reading."
    },
    {
      "symptom": "Social Withdrawal",
      "excerpts": [
        {
          "entry": 2,
          "excerpt": "I should probably try to be more social, but it feels like too much effort"
        },
        {
          "entry": 4,
          "excerpt": "I just didn't feel up to pretending to be cheerful"
        }
      ],
      "reason": "The patient chooses not to engage in social activities and prefers to be alone, as evidenced by feeling that being more social requires too much effort and not feeling up to pretending to be cheerful."
    },
    {
      "symptom": "Negative Symptoms like Diminished Emotional Expression",
      "excerpts": [
        {
          "entry": 3,
          "excerpt": "I sometimes feel so disconnected from them"
        }
      ],
      "reason": "The patient experiences a reduction in emotional expression or motivation, as evidenced by feeling disconnected from others."
    },
    {
      "symptom": "Excessive Worry",
      "excerpts": [
        {
          "entry": 3,
          "excerpt": "My thoughts kept wandering to negative things, like past mistakes and worries about the future"
        }
      ],
      "reason": "The patient exhibits an extreme level of worry about various things, as evidenced by their thoughts wandering to negative things and worries about the future."
    }
  ],
}

const HighlightText = ({ higlights, value }: {
  higlights: string[];
  value: string;
}) => {
  const getHighlightedText = (text:string, higlights: string[]) => {
    if (!higlights.length) return (<React.Fragment>{text}</React.Fragment>)
    // Split on higlights and render hightlighted parts
    const regex = new RegExp(higlights.map(i => `(${i})`).join('|'), 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, index) =>
          higlights.find((highlight) => highlight.toLowerCase() === part.toLowerCase()) ? (
            <span key={index} className="bg-yellow-200">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  }
  return <React.Fragment>{getHighlightedText(value, higlights)}</React.Fragment>;
};



export default function DemoPage() {
  const [userInput, setUserInput] = useState('');  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [therapistFeedback, setTherapistFeedback] = useState<Therapist | null>(null);
  const [currentSymptom, setCurrentSymptom] = useState<string | null>(null);
  useEffect(() => {
    fetchEntries();
  }, []);

  const openModal = () => {
    document.getElementById('add_modal')?.showModal();
  }

  const closeModal = () => {
    document.getElementById('add_modal')?.close();
  }
  const fetchEntries = async () => {
    try {
      const data = await getEntries();
      setTherapistFeedback(mockTherapistFeedback);
      const orderEntries = data.entries.reverse().map((entry: Entry) => {
        entry.patient = mockPatientFeedback;
        return entry
      });
      setEntries(orderEntries);
    } catch(err) {
      throw err;
    }
  }
  const handleSubmit = async () => {
      // Handle the submission logic here
      try {
        const data = await postDiaryEntry(userInput);
        await fetchEntries();
        closeModal()
        setUserInput('');
      } catch(err) {
        console.log('error', err);
      }
  };
  const handleClickSymptom = (symptom: string) => {
    setCurrentSymptom(symptom);
  }
  const DisorderPanel = ({therapistFeedback, currentSymptom}: {therapistFeedback: Therapist, currentSymptom: string | null}) =>  {
    return (
      <div className="w-3/12 pr-4">
        <h3 className="text-md font-bold">Action</h3>
        <div className="rounded-sm shadow-lg p-4 mb-2">
          {therapistFeedback.actions}
        </div>
        <h3 className="text-md font-bold">Symptoms</h3>
        {therapistFeedback.symptoms.map((data, index) => (
          <div className="collapse collapse-arrow bg-base-200 mt-4" key={index}>
            <input type="radio" name="my-accordion-2" checked={currentSymptom === data.symptom } onChange={() => handleClickSymptom(data.symptom)} /> 
            <div className="collapse-title text-md font-medium" >
              {data.symptom}
            </div>
            <div className="collapse-content"> 
              <p>{data.reason}</p>
            </div>
          </div>)
        )}
      </div>
    )
  }

  const EntryList = ({entries}: {entries: Entry[]}) => {
    return (
      <div className="w-9/12">
          {entries.map((entry: Entry, index) => {
            let highlights: string[] = [];
            if (currentSymptom) {
              const currentSymtomDetail = therapistFeedback?.symptoms.find((symptom: any) => symptom.symptom === currentSymptom)
              const currentExcerpts = currentSymtomDetail?.excerpts.filter((excerpt: any) => String(excerpt.entry) === String(entry.id)) || [];
              highlights = currentExcerpts.map((excerpt: any) => excerpt.excerpt) || [];
            }
            console.log('highlights', highlights);
            return (
            <div key={index} className="bg-base-100 flex border-solid border-2 mt-2 rounded-sm">
              <div className="w-4/5 m-4">
                <h2 className="card-title">{entry.timestamp}</h2>
                <p><HighlightText value={entry.content} higlights={highlights} /></p>
              </div>
              <div className="border-l-4 border-indigo-500 w-2/5 p-2 ">
                <p className="font-normal w-full text-md">
                  {entry.patient.summary}
                </p>
              </div>
            </div>
            )}
          )}
      </div>
    )
  }
  
    
  return (
    <AnimatePresence>
        <div className="navbar bg-base-100 shadow-md">
          <a className="btn btn-ghost normal-case text-xl">labradoodle.ai</a>
        </div>
        <div className="pl-4 pr-4 relative">
          <button className="btn btn-primary fixed top-2 right-4" onClick={() => openModal(true)}>Add Entry</button>
          <div className="w-full min-h-screen flex items-start mt-4">
            {therapistFeedback && <DisorderPanel currentSymptom={currentSymptom} therapistFeedback={therapistFeedback}/> }
            <EntryList entries={entries}/>
          </div>
        </div>
        <dialog id="add_modal" className="modal" modal-open>
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg">Add new journal</h3>
            <div className="space-y-6">
              <div className="mb-4">
                <textarea 
                  rows={6}
                  className="textarea textarea-bordered w-full" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Bio"></textarea>
              </div>
              <div className="flex justify-end">
                <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
              </div>
            </div>
          </div>
        </dialog>
    </AnimatePresence>
  );
}
