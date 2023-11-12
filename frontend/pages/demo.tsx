"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { postDiaryEntry, deleteEntry, getEntries, Entry, triggerAnalysis, PatientFeedback, TherapistResult } from '../pages/api/entry';
import dayjs from 'dayjs';
import { UserType } from "@/utils";
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { v4 } from "uuid";

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
        {parts.map((part, index) => {
          const higlightItem = higlights.find((f) => f?.toLowerCase() === part?.toLowerCase());
          return higlightItem ? (
            <span key={`${part}-${index}`} className="bg-yellow-200">
              {part}
            </span>
          ) : (
            <span key={`${part}-${index}`}>{part}</span>
          )
        })}
      </span>
    );
  }
  return <React.Fragment>{getHighlightedText(value, higlights)}</React.Fragment>;
};

const UnderlineText = ({ feedback, value }: {
  feedback: PatientFeedback[];
  value: string;
}) => {
  const getFeedbackText = (text:string, feedback: PatientFeedback[]) => {
    if (!feedback || !feedback.length) return (<React.Fragment>{text}</React.Fragment>)
    // Split on higlights and render hightlighted parts
    const regex = new RegExp(feedback.map(i => `(${i.excerpt})`).join('|'), 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, index) => {
          const feedbackItem = feedback.find((f) => f.excerpt?.toLowerCase() === part?.toLowerCase());
          function TipContent() {
            return (
              <div className="w-72">
                <div className="badge badge-primary font-bold text-white mr-2 rounded-sm">{feedbackItem?.criteria}</div>
                <span>{feedbackItem?.feedback}</span>
              </div>
            )
          }
          const id = v4();
          return feedbackItem ? (
            <div key={id} className="inline">
              <span data-tooltip-id={id} data-tooltip-target="tooltip-bottom" data-tooltip-placement="right" className="border-b-2 border-primary">
                {part}
              </span>
              <Tooltip
                id={id}
                place="bottom"
                content={TipContent as string}
              />
            </div>
        ): (
            <span key={id}>{part}</span>
          )
        })}
      </span>
    );
  }
  return <React.Fragment>{getFeedbackText(value, feedback)}</React.Fragment>;
};



export default function DemoPage() {
  const [userInput, setUserInput] = useState('');  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [therapistFeedback, setTherapistFeedback] = useState<TherapistResult | null>(null);
  const [currentSymptom, setCurrentSymptom] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  
  useEffect(() => {
    const user = localStorage.getItem("user-type");
    if (!user) {
      // Redirect to home page
      window.location.href = "/";
    }
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
      const entries = data.entries;
      if (entries.length === 0) return;
      const lastestEntry = entries[entries.length - 1];
      setTherapistFeedback({
        actions: lastestEntry.therapist_summary,
        symptoms: lastestEntry.therapist_feedback,
      });
      setEntries(entries);
    } catch(err) {
      throw err;
    }
  }
  const handleSubmit = async () => {
      // Handle the submission logic here
      try {
        const data = await postDiaryEntry(userInput);
        await fetchEntries();
        triggerAnalysis().then((res) => {
          fetchEntries();
        })
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
        <h3 className="text-xl mt-3 font-bold">Patient Summary</h3>
        <div className="mt-4 rounded-md shadow-lg p-4 mb-2 bg-white">
          {therapistFeedback.actions}
        </div>
        <h3 className="text-xl font-bold mt-4">Symptoms</h3>
        {therapistFeedback.symptoms.map((data, index) => (
          <div className="collapse collapse-arrow bg-primary text-primary-content mt-4" key={index}>
            <input type="radio" name="my-accordion-2" checked={currentSymptom === data.symptom } onChange={() => handleClickSymptom(data.symptom)} /> 
            <div className="collapse-title text-md font-bold" >
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
        <div className="flex">
          <div className="w-4/5 flex justify-end items-end">{ isPatient && <button className="btn btn-primary btn-sm mr-4 rounded-md shadow-lg" onClick={() => openModal()}>Add</button>}</div>
          <div className="w-2/5 flex items-center">
            <div className="avatar justify-start">
              <div className="w-10 rounded-full ring ring-base-100 ring-offset-base-100">
                <img src="/labradoodle-no-bg.png" />
              </div>
            </div>
            <h3 className="text-xl font-bold ml-2">Labradoodle</h3>
          </div>
        </div>
          {entries
          .map((entry: Entry, index) => {
            let highlights: string[] = [];
            if (currentSymptom) {
              const currentSymtomDetail = therapistFeedback?.symptoms.find((symptom: any) => symptom.symptom === currentSymptom)
              const currentExcerpts = currentSymtomDetail?.excerpts.filter((excerpt: any) => String(excerpt.entry) === String(index)) || [];
              highlights = currentExcerpts.map((excerpt: any) => excerpt.excerpt) || [];
            }
            return (
            <div key={index} className="flex rounded-sm">
              <div className="w-4/5 mt-4 mr-4 bg-base-100 p-2">
                <div className="flex justify-between">
                <h2 className="card-title">{dayjs(entry.timestamp).format('DD/MM/YYYY hh:mm A')}</h2>
                { isPatient && <div className="dropdown">
                        <label tabIndex={0} className="w-6 h-6">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className= "w-6 h-6 p-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                          </svg>
                        </label>
                      <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                        <li><button onClick={() => handleDelete(entry.id)}>Delete</button></li>
                      </ul>
                    </div>
                }
                </div>
                <p>{isPatient ? 
                  <UnderlineText value={entry.content} feedback={entry.patient_feedback} /> 
                  : <HighlightText value={entry.content} higlights={highlights} />}</p>
              </div>
              {<div className="self-start border-l-4 border-indigo-500 w-2/5 p-2 mt-4 bg-base-100 ">
                {entry.patient_summary  ?
                <p className="font-normal w-full text-md">
                  {entry.patient_summary}
                </p> : <p className="flex items-center"><span className="loading loading-dots loading-md mr-4"/> I am thinking</p>
               }
              </div> 
              }
            </div>
            )}
          ).reverse()}
      </div>
    )
  }
  const isPatient = user === UserType.Patient;
  return (
    <div>
        <div className="navbar bg-base-100 shadow-md flex justify-between sticky top-0 z-50">
          <div className="ml-4">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img src="/labradoodle-no-text.png" />
            </div>
            <a className="btn btn-ghost normal-case text-xl">labradoodle.ai</a>
          </div>
          </div>
          <div className="">
            <span className="mr-4">{user || 'Login'}</span>
          </div>
        </div>
        <div className="pl-4 pr-4">
          <div className="w-full min-h-screen flex items-start mt-4">
            <DisorderPanel currentSymptom={currentSymptom} therapistFeedback={therapistFeedback}/>
            <EntryList entries={entries}/>
          </div>
        </div>
        <dialog id="add_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg mt-4">Add your journal</h3>
            <div className="space-y-6 mt-2">
              <div className="mb-4">
                <textarea 
                  rows={6}
                  className="textarea textarea-bordered w-full leading-5" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="How are you feeling overall? (e.g., physical sensations, mental state)"></textarea>
              </div>
              <div className="flex justify-end">
                <button className="btn btn-primary siz rounded-md" onClick={handleSubmit}>Submit</button>
              </div>
            </div>
          </div>
        </dialog>
    </div>
  );
}
