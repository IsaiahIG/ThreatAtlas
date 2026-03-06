"use client";

import { HiMagnifyingGlass } from "react-icons/hi2";
import { useState } from "react";

export default function File(){

  const [file, setFile] = useState("");


  return (
    <div className="w-full p-5 h-full flex justify-center items-center gap-x-5">
      <input
        value={file}
        onChange={(e) => setFile(e.target.value)}
        placeholder="192.168.1.1"
        className="w-full bg-slate-800/90 rounded-sm hover:ring-[#196adc] hover:shadow-2xl hover:shadow-[#196adc] hover:ring-1 text-neutral-500 border border-neutral-700 px-3 py-2 text-md outline-none"
      />

      <div className="  bg-[#196adc] transition-all flex p-2  cursor-pointer hover:-translate-y-1 hover:shadow-md hover:bg-blue-400 hover:shadow-[#196adc] rounded-sm">
        
              <button>
                <HiMagnifyingGlass className="size-7"/>
                
                </button>

</div>  

    </div>
  );
    
    
    
    
    
}