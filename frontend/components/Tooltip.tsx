import React from "react";

export function Tooltip({id} : {id: string}) {
    const showTooltip = (id:string) => {
      document.getElementById(id)?.classList?.remove("hidden");
    }
    const hideTooltip = (id: string) => {
      document.getElementById(id)?.classList.add("hidden");
    }
  return  (<a role="link" aria-label="tooltip 1" className="focus:outline-none focus:ring-gray-300 rounded-full focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 relative mt-20 md:mt-0" onMouseOver={() => showTooltip(id)} onFocus={() =>showTooltip(id)} onmouseout={() => hideTooltip(id)}>
            <div id={id} role="tooltip" className="z-20 -mt-20 w-64 absolute transition duration-150 ease-in-out left-0 ml-8 shadow-lg bg-white p-4 rounded">
                hover
                <p className="text-sm font-bold text-gray-800 pb-1">Keep track of follow ups</p>
                <p className="text-xs leading-4 text-gray-600 pb-3">Reach out to more prospects at the right moment.</p>
                <div className="flex justify-between">
                    <div className="flex items-center">
                        <span className="text-xs font-bold text-indigo-700">Step 1 of 4</span>
                    </div>
                    <div className="flex items-center">
                        <button className="focus:outline-none  focus:text-gray-400 text-xs text-gray-600 underline mr-2 cursor-pointer">Skip Tour</button>
                        <button onBlur={() => hideTooltip(id)} className="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 focus:bg-indigo-400 focus:outline-none bg-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 rounded text-white px-5 py-1 text-xs">Next</button>
                    </div>
                </div>
            </div>
        </a>
                           
        )
        
}

