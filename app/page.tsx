"use client";

import { useEffect, useRef, useState } from "react";
import { FaBookDead, FaRegQuestionCircle } from "react-icons/fa";
import { IoLink } from "react-icons/io5";
import { CiGlobe } from "react-icons/ci";
import { RxServer } from "react-icons/rx";
import { FiHash } from "react-icons/fi";
import { MdOutlineFileUpload } from "react-icons/md";

import Domain from "@/components/Domain";
import File from "@/components/File";
import IP from "@/components/IP";
import Hash from "@/components/Hash";
import URL from "@/components/URL";

export default function Malwarescan() {
  type Method = "file" | "url" | "domain" | "ip" | "hash";

  const [method, setMethod] = useState<Method>("url");
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!infoRef.current) return;
      if (!infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    }

    if (showInfo) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInfo]);

  function renderPage() {
    switch (method) {
      case "url":
        return <URL />;
      case "domain":
        return <Domain />;
      case "ip":
        return <IP />;
      case "hash":
        return <Hash />;
      case "file":
        return <File />;
      default:
        return null;
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        className="fixed inset-0 -z-10 bg-black
        bg-[linear-gradient(to_right,#272727_1px,transparent_1px),linear-gradient(to_bottom,#272727_1px,transparent_1px)]
        bg-size-[70px_40px]"
      />

      <div
        ref={infoRef}
        className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6 lg:right-8 lg:top-8"
      >
        <div className="relative">
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className="flex items-center justify-center rounded-full text-neutral-300 transition hover:text-[#196adc]"
            aria-label="Project disclaimer"
          >
            <FaRegQuestionCircle className="size-5 hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer sm:size-6" />
          </button>

          {showInfo && (
            <div className="absolute right-0 mt-3 w-[280px] border border-neutral-700 cursor-pointer bg-neutral-950/95 p-3 text-left shadow-2xl backdrop-blur-xl sm:w-[340px]">
              <p className="font-mono text-[11px] leading-5 text-neutral-200 sm:text-xs">
                Threat Atlas is an independent project that uses the VirusTotal
                API. It is not affiliated with, endorsed by, or an official
                product of VirusTotal. Scan results are provided through
                VirusTotal services and remain subject to their terms and usage
                limits.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="min-h-screen w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center">
          <div className="flex w-full flex-col items-center justify-center space-y-8 sm:space-y-10">
            <div className="flex w-full flex-col items-center justify-center space-y-4 text-center">
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <FaBookDead className="size-10 text-[#196adc] sm:size-12" />

                <h1 className="font-mono text-3xl tracking-widest text-white sm:text-4xl">
                  Threat{" "}
                  <span className="font-bold tracking-widest text-[#196adc]">
                    Atlas
                  </span>
                </h1>
              </div>

              <p className="max-w-2xl px-2 font-mono text-xs tracking-widest text-neutral-200 sm:text-sm">
                Analyse suspicious files, domains, IPs and URLs
                <br />
                to detect malware and other breaches
              </p>
            </div>

            <div className="mx-auto w-full max-w-4xl">
              <div className="w-full border border-neutral-700 bg-neutral-900/40 backdrop-blur-2xl">
                <nav className="flex flex-wrap items-center justify-center gap-4 p-4 sm:gap-6 md:justify-between">
                  <div className="flex items-center justify-center space-x-2 transition-all hover:-translate-y-1">
                    <IoLink className="size-5 text-[#196adc]" />
                    <button
                      onClick={() => setMethod("url")}
                      className={`font-mono text-sm cursor-pointer sm:text-base ${
                        method === "url"
                          ? "border-b-2 border-[#196adc] text-[#196adc]"
                          : "text-neutral-200 hover:text-[#196adc]"
                      }`}
                    >
                      URL
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 transition-all hover:-translate-y-1">
                    <CiGlobe className="size-5 text-[#196adc]" />
                    <button
                      onClick={() => setMethod("domain")}
                      className={`font-mono text-sm cursor-pointer sm:text-base ${
                        method === "domain"
                          ? "border-b-2 border-[#196adc] text-[#196adc]"
                          : "text-neutral-200 hover:text-[#196adc]"
                      }`}
                    >
                      Domain
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 transition-all hover:-translate-y-1">
                    <RxServer className="size-5 text-[#196adc]" />
                    <button
                      onClick={() => setMethod("ip")}
                      className={`font-mono text-sm cursor-pointer sm:text-base ${
                        method === "ip"
                          ? "border-b-2 border-[#196adc] text-[#196adc]"
                          : "text-neutral-200 hover:text-[#196adc]"
                      }`}
                    >
                      IP
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 transition-all hover:-translate-y-1">
                    <FiHash className="size-5 text-[#196adc]" />
                    <button
                      onClick={() => setMethod("hash")}
                      className={`font-mono text-sm cursor-pointer sm:text-base ${
                        method === "hash"
                          ? "border-b-2 border-[#196adc] text-[#196adc]"
                          : "text-neutral-200 hover:text-[#196adc]"
                      }`}
                    >
                      Hash
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 transition-all hover:-translate-y-1">
                    <MdOutlineFileUpload className="size-5 text-[#196adc]" />
                    <button
                      onClick={() => setMethod("file")}
                      className={`font-mono text-sm cursor-pointer sm:text-base ${
                        method === "file"
                          ? "border-b-2 border-[#196adc] text-[#196adc]"
                          : "text-neutral-200 hover:text-[#196adc]"
                      }`}
                    >
                      File
                    </button>
                  </div>
                </nav>

                <div className="h-px w-full bg-neutral-700" />

                <div className="w-full p-4 sm:p-6 md:p-8">{renderPage()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}