"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { postDiaryEntry, deleteEntry, getEntries, Entry, TherapistResult, Patient, TherapistFeedback } from '../pages/api/entry';
import dayjs from 'dayjs';
import { UserType } from "@/utils";


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

// const UnderlineText = ({ feedback, value }: {
//   feedback: Feedback[];
//   value: string;
// }) => {
//   const getFeedbackText = (text:string, feedback: Feedback[]) => {
//     if (!feedback.length) return (<React.Fragment>{text}</React.Fragment>)
//     // Split on higlights and render hightlighted parts
//     const regex = new RegExp(feedback.map(i => `(${i.excerpt})`).join('|'), 'gi');
//     const parts = text.split(regex);
//     return (
//       <span>
//         {parts.map((part, index) => {
//           const feedbackItem = feedback.find((f) => f.excerpt.toLowerCase() === part.toLowerCase());
//           return feedbackItem ? (
//             <div className="tooltip" data-tip={feedbackItem.feedback}>
//               <span key={index} className="underline">
//                 {part}
//               </span>
//             </div>
//           ) : (
//             <span key={index}>{part}</span>
//           )}
//         )
//           }
//       </span>
//     );
//   }
//   return <React.Fragment>{getFeedbackText(value, feedback)}</React.Fragment>;
// };



export default function DemoPage() {
  const [userInput, setUserInput] = useState('');  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [therapistFeedback, setTherapistFeedback] = useState<TherapistResult | null>(null);
  const [currentSymptom, setCurrentSymptom] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  
  useEffect(() => {
    const user = localStorage.getItem("user-type");
    setUser(user);
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
      const orderEntries = data.entries.reverse().map((entry: Entry) => {
        if (entry['patient summary']) {
          entry.patient_summary = entry['patient summary'];
          delete entry['patient summary'];
        }
        if (entry['patient feedback']) {
          entry.patient_feedback = entry['patient feedback'];
          delete entry['patient feedback'];
        }
        if (entry['therapist summary']) {
          entry.therapist_summary = entry['therapist summary'];
          delete entry['therapist summary'];
        }
        if (entry['therapist feedback']) {
          entry.therapist_feedback = entry['therapist feedback'];
          delete entry['therapist feedback'];
        }
        return entry
      });
      if (orderEntries.length === 0) return;
      const lastestEntry = orderEntries[orderEntries.length - 1];
      setTherapistFeedback({
        actions: lastestEntry.therapist_summary,
        symptoms: lastestEntry.therapist_feedback,
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

  const handleDelete  = async (id: string) => {
    try {
      await deleteEntry(id);
      await fetchEntries();
    } catch(err) {
      console.log('error', err);
    }
  } 
  const DisorderPanel = ({therapistFeedback, currentSymptom}: {therapistFeedback: TherapistResult | null, currentSymptom: string | null}) =>  {
    if (!therapistFeedback || user !== UserType.Therapist) return <div className="w-3/12 pr-4" />
    return (
      <div className="w-3/12 pr-4">
        <h3 className="text-xl font-bold">Action</h3>
        <div className="mt-2 rounded-md shadow-lg p-4 mb-2 bg-white">
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
          <h3 className="text-xl font-bold">Entries</h3>
          {entries.map((entry: Entry, index) => {
            let highlights: string[] = [];
            if (currentSymptom) {
              const currentSymtomDetail = therapistFeedback?.symptoms.find((symptom: any) => symptom.symptom === currentSymptom)
              const currentExcerpts = currentSymtomDetail?.excerpts.filter((excerpt: any) => String(excerpt.entry) === String(entry.id)) || [];
              highlights = currentExcerpts.map((excerpt: any) => excerpt.excerpt) || [];
            }
            return (
            <div key={index} className="flex border-solid border-2 rounded-sm">
              <div className="w-4/5 mt-4 mr-4 bg-base-100 p-2">
                <div className="flex justify-between">
                <h2 className="card-title">{dayjs(entry.timestamp).format('DD/MM/YYYY hh:mm A')}</h2>
                { isPatient && <div className="dropdown">
                  <button className="btn btn-square">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                      </svg>
                      </button>
                      <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                        <li><button onClick={() => handleDelete(entry.id)}>Delete</button></li>
                      </ul>
                    </div>
                }
                </div>
                <p><HighlightText value={entry.content} higlights={highlights} /></p>
              </div>
              {entry.patient_summary ? <div className="self-start border-l-4 border-indigo-500 w-2/5 p-2 mt-4 bg-base-100 ">
                <p className="font-normal w-full text-md">
                  {entry.patient_summary}
                </p> 
              </div> : <div className="w-2/5 p-2 " />
              }
            </div>
            )}
          )}
      </div>
    )
  }
  const isPatient = user === UserType.Patient;
  return (
    <AnimatePresence>
        <div className="navbar bg-base-100 shadow-md flex justify-between sticky top-0 z-50">
          <a className="btn btn-ghost normal-case text-xl">labradoodle.ai</a>
          <div className="">
            { isPatient &&  <button className="btn btn-primary right-4" onClick={() => openModal(true)}>Add Entry</button>}
            <span className="ml-4">{user || 'Login'}</span>
          </div>
        </div>
        <div className="pl-4 pr-4">
          <div className="w-full min-h-screen flex items-start mt-4">
            <DisorderPanel currentSymptom={currentSymptom} therapistFeedback={therapistFeedback}/>
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
