"use client"
import { useState } from "react";
import { FaBookDead } from "react-icons/fa";
import { IoLink } from "react-icons/io5";
import { CiGlobe } from "react-icons/ci";
import { RxServer } from "react-icons/rx";
import { FiHash } from "react-icons/fi";
import { MdOutlineFileUpload } from "react-icons/md";
import  Domain from "@/components/Domain";
import  File from "@/components/File";
import  IP from "@/components/IP";
import  Hash from "@/components/Hash";
import  URL from "@/components/URL";









export default function Malwarescan(){


  type Method = "file" | "url"| "domain" | "ip" | "hash";

  const [method, setMethod] = useState("url");

  function renderPage(){

    switch(method){

      case"url":
      return <URL/>;
      case "domain":
      return <Domain/>;
      case "ip":
      return <IP/>;
      case "hash":
      return <Hash/> ;
      case "file":
      return <File/>;

      default: 
      return null;

    }

  }

    return (

          <div className="absolute inset-0   -z-15 h-full w-full bg-black-800 bg-[linear-gradient(to_right,#272727_1px,transparent_1px),linear-gradient(to_bottom,#272727_1px,transparent_1px)] bg-size-[100px_50px]">
            
            <div className="max-w-7xl  mx-auto pt-25">
              
              <div className="space-y-15  pt-8">

            
              <div className = " mx-auto ">  
                
                <div className=" space-y-10 flex justify-center  items-center p-2 ">

                  <div className="flex-col">

                  <div className="flex  justify-center space-x-6 ">
                    
                    <span> <FaBookDead className="size-12 pb-2 text-[#196adc]"/>
                    </span>

                    <h1 className=" text-mono text-center tracking-widest text-4xl text-white  "> Threat <span className="text-[#196adc] font-bold  tracking-widest ">Atlas</span> </h1>
 
                 </div>

                 
                 </div>

                  
                  </div>

                   <div className="space-y-12  mx-auto">
                      
                    <p className="text-sm text-center font-mono tracking-widest  pt-5"> Analyse suspicious files, domains, IPs and URLs <span> <br/> to detect malware and other breaches</span> 
                    </p>  
                    
                    
                    <div className=" max-w-3xl bg-neutral-900/40 backdrop-blur-2xl w-full h-full mx-auto border border-neutral-700 ">

                      <nav className="text-black flex p-4 justify-between">

                        <div className="flex justify-center items-center cursor-pointer  space-x-2 hover:text-gray-400  hover:-translate-y-1 transitions-all hover:shadow-2xl"> 

                          <IoLink className="size-5 text-[#196adc]"/>
                          
                          <button onClick={() => setMethod("url")}
                          className={`  hover:text-[#196adc] font-mono curosor-pointer    text-md ${method == "url" ? "border-b-2 border-[#196adc] text-[#196adc]" : "text-neutral-200"}`  }>
                            
                            URL
                            </button>
                          
                          </div>


                          <div className="flex justify-center items-center cursor-pointer space-x-2 hover:text-gray-400 hover:-translate-y-1 transitions-all hover:shadow-2xl"> 

                          <CiGlobe className="size-5 text-[#196adc]"/>
                          
                          <button onClick = {() => setMethod("domain")}
                          className={`  hover:text-neutral-300 font-mono curosor-pointer  text-md ${ method == "domain" ? "border-b-2 border-[#196adc] text-[#196adc]" :"text-neutral-200"}`}>
                            
                            Domain
                            </button>
                          

                          </div>

                          <div className="flex justify-center items-center cursor-pointer space-x-2 hover:text-gray-400 hover:-translate-y-1 transitions-all hover:shadow-2xl"> 

                          <RxServer className="size-5 text-[#196adc]"/>
                          
                          <button onClick ={() =>setMethod("ip") }
                          className={` hover:text-neutral-300 font-mono curosor-pointer  text-md ${method == "ip" ? "border-b-2 border-[#196adc] text-[#196adc]" : "text-neutral-200"}`}>
                            
                            IP
                            </button>
                          
                          </div>

                          <div className="flex justify-center items-center cursor-pointer space-x-2  hover:border-b-[#] hover:text-gray-400 hover:-translate-y-1 transitions-all hover:shadow-2xl"> 

                          <FiHash className="size-5 text-[#196adc]"/>
                          
                          <button onClick ={() => setMethod("hash")}
                          className={` hover:text-neutral-300 font-mono curosor-pointer  text-md ${method == "hash" ? "border-b-2 border-[#196adc] text-[#196adc]" : "text-neutral-200"}`}>
                            
                            Hash
                            </button>
                          
                          </div>

                          <div className="flex justify-center items-center cursor-pointer space-x-2 hover:text-gray-400 hover:-translate-y-1 transitions-all hover:shadow-2xl"> 

                          <MdOutlineFileUpload className="size-5 text-[#196adc]"/>
                          
                          <button onClick={()=>setMethod("file")}
                          className= {`hover:text-neutral-300 font-mono curosor-pointer  text-md ${method=="file"?"border-b-2 border-[#196adc] text-[#196adc]" : "text-neutral-200"}`}>
                            
                            File
                            </button>
                          
                          </div>
                          

                      </nav>

                      <div className="w-full h-px bg-neutral-700 "/>

                      <div className="w-full-h-full p-6">{renderPage()}</div>



                    </div>
                    
                    </div>

                
                  </div>

              

                    </div>

                
            </div>

                  
                </div>

    );



}

