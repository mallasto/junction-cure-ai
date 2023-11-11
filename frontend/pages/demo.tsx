import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Tab } from '@headlessui/react'
import { Button, Card, Modal } from "flowbite-react";
import { postDiaryEntry } from '../pages/api/entry';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const journals = [{
  date: '2021-10-01',
  content: 'Today was just okay. Work was the usual mix of meetings and deadlines. Managed to get most of my tasks done, but couldn\'t shake off this lingering feeling of being overwhelmed, even by small things. Dinner was nice, made spaghetti, my favorite, but it didn\'t taste as good as it usually does. Feeling pretty tired, although I didn\'t do much. Going to try and get some sleep, hopefully will feel more energized tomorrow.',
}, {
  date: '2021-10-02',
  content: 'Struggled to get out of bed this morning, even though I slept a decent amount. The weather was gloomy, which didn’t help my mood. Work was fine, nothing special. I’ve been finding it hard to concentrate lately, my mind keeps drifting off. In the evening, I decided to skip my usual jog. Just wasn\'t feeling up to it. Ended up watching some TV, but I can\'t even remember what I watched.',
}]



const HighlightText = ({ higlight, value }: {
  higlight: string;
  value: string;
}) => {
  const getHighlightedText = (text:string, higlight: string) => {
    // Split text on higlight term, include term itself into parts, ignore case
    var parts = text.split(new RegExp(`(${higlight})`, "gi"));
    return parts.map((part, index) => {
      console.log('index', index)
      return (
      <React.Fragment key={index}>
        {part.toLowerCase() === higlight.toLowerCase() ? (
          <b style={{ backgroundColor: "#e8bb49" }}>{part}</b>
        ) : (
          part
        )}
      </React.Fragment>
      )})
  }
  return <React.Fragment>{getHighlightedText(value, higlight)}</React.Fragment>;
};

function UserFeedback() {
  return (
    <div className="shadow-inner mr-4">
      <Card href="#" className="max-w-sm">
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
        </p>
      </Card>
    </div>
  )
}

function DisorderTabs() {
  let [disorders] = useState({
    Depressive: {
        id: 1,
        entries: ['Does drinking coffee make you smarter?', 'How to make the perfect pour over'],
        date: '5h ago',
        reason: 'Depressive',
    },
    Anxiety: {
      id: 1,
      entries: ['Does drinking coffee make you smarter?', 'How to make the perfect pour over'],
      date: '5h ago',
      reason: 'Depressive',
    },
    Stress: {
      id: 1,
      entries: ['Does drinking coffee make you smarter?', 'How to make the perfect pour over'],
      date: '5h ago',
      reason: 'Depressive',
    },
  })
  return (
    <div className="w-140 max-w-md pr-4">
        <Tab.Group vertical >
          <Tab.List className="w-64 space-x-1 rounded-xl bg-blue-900/20 p-1">
            {Object.keys(disorders).map((disorder) => (
              <Tab
                key={disorder}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                    'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                {disorder}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
    </div>
  )
}

function DiaryBox() {
  return (
    <div className="flex-auto">
      <div className="flex flex-col">
        {journals.map((journal, index) => (
          <div key={index} className="flex">
            <Card className="max-w mr-4 mb-4 pt-0">
              <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-600 ">{journal.date}</span>
                  <a className="px-2 py-1 bg-gray-600 text-gray-100 font-bold rounded hover:bg-gray-500" href="#">Edit</a>
              </div>
              <div className="mt-2">
                  <p className="mt-2 text-gray-600"><HighlightText value={journal.content} higlight={'and'} /></p>
              </div>
            </Card>
            <UserFeedback/>
          </div>
        ))}
      </div>
    </div>
  )
}


export default function DemoPage() {
  const [openModal, setOpenModal] = useState(false);
  const [userInput, setUserInput] = useState('');  
  const handleSubmit = async () => {
      // Handle the submission logic here
      console.log('User input submitted:', userInput);
      try {
        const data = await postDiaryEntry(userInput);
        console.log('data', data);
      } catch(err) {
        console.log('error', err);
      }
    };
    
  return (
    <AnimatePresence>
        <div className="h-14 w-full shadow-md mt-4">
            <h1 className="text-xl pl-4 font-bold">labradoodle.ai</h1>
        </div>
        <div className="flex justify-end mr-4 mt-4">
          <Button color="blue" onClick={() => setOpenModal(true)}>Add </Button>
        </div>
        <div className="w-full min-h-screen flex items-start mt-4">
          <DisorderTabs />
          <DiaryBox/>
        </div>
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>Terms of Service</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <div className="mb-4">
                <label htmlFor="userInput" className="text-sm font-medium text-gray-700">
                  Write the journal:
                </label>
                <input
                  type="text"
                  id="userInput"
                  className="mt-1 p-2 border rounded-md w-full"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSubmit}>Confirm</Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
        </Modal.Footer>
      </Modal>
    </AnimatePresence>
  );
}
