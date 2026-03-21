"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RxExclamationCircled } from "react-icons/rx";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdOutlineFileUpload } from "react-icons/md";

import { LoaderPinwheel } from "@/components/animate-ui/icons/loader-pinwheel";

type VTStats = {
  harmless?: number;
  malicious?: number;
  suspicious?: number;
  undetected?: number;
  timeout?: number;
};

type EngineRow = {
  engine: string;
  category: string;
  result: string | null;
};

type Tone = "red" | "yellow" | "green" | "gray";
type Kind = "good" | "warn" | "bad" | "neutral";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function normalize(s?: string | null) {
  return (s ?? "").toLowerCase().trim();
}

function toneClasses(tone: Tone) {
  switch (tone) {
    case "red":
      return { text: "text-red-400", icon: "text-red-400" };
    case "yellow":
      return { text: "text-yellow-300", icon: "text-yellow-300" };
    case "green":
      return { text: "text-emerald-400", icon: "text-emerald-400" };
    default:
      return { text: "text-neutral-400", icon: "text-neutral-400" };
  }
}

function verdictMeta(category: string, result: string | null) {
  const cat = normalize(category);
  const res = normalize(result);

  if (res.includes("malware")) {
    return { label: "Malware", tone: "red" as Tone, kind: "bad" as Kind };
  }

  if (res.includes("spam")) {
    return { label: "Spam", tone: "yellow" as Tone, kind: "warn" as Kind };
  }

  if (res === "clean") {
    return { label: "Clean", tone: "green" as Tone, kind: "good" as Kind };
  }

  if (res === "unrated") {
    return { label: "Unrated", tone: "gray" as Tone, kind: "neutral" as Kind };
  }

  if (cat === "malicious") {
    return { label: "Malicious", tone: "red" as Tone, kind: "bad" as Kind };
  }

  if (cat === "suspicious") {
    return { label: "Suspicious", tone: "yellow" as Tone, kind: "warn" as Kind };
  }

  if (cat === "harmless") {
    return { label: "Clean", tone: "green" as Tone, kind: "good" as Kind };
  }

  if (cat === "undetected") {
    return { label: "Undetected", tone: "gray" as Tone, kind: "neutral" as Kind };
  }

  if (cat === "timeout") {
    return { label: "Timeout", tone: "gray" as Tone, kind: "neutral" as Kind };
  }

  return {
    label: category || "Unknown",
    tone: "gray" as Tone,
    kind: "neutral" as Kind,
  };
}

function sumStats(stats: VTStats | null) {
  if (!stats) return 0;

  return (
    (stats.malicious ?? 0) +
    (stats.suspicious ?? 0) +
    (stats.undetected ?? 0) +
    (stats.harmless ?? 0) +
    (stats.timeout ?? 0)
  );
}

function rankEngine(e: { category: string; result: string | null }) {
  const cat = (e.category ?? "").toLowerCase();
  const res = (e.result ?? "").toLowerCase();

  if (cat === "malicious" || res.includes("malware") || res === "malicious") return 0;
  if (cat === "suspicious" || res.includes("spam") || res === "suspicious") return 1;
  if (cat === "harmless" || res === "clean") return 2;
  if (res === "unrated") return 3;
  return 4;
}

export default function File() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [stats, setStats] = useState<VTStats | null>(null);
  const [engines, setEngines] = useState<EngineRow[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showModal) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  async function runUpload() {
    if (!file || loading) return;

    setLoading(true);
    setError("");
    setStats(null);
    setEngines([]);
    setShowModal(false);

    try {
      const minSpinner = delay(3000);

      const fetchPromise = (async () => {
        const form = new FormData();
        form.append("file", file);
        if (password.trim()) form.append("password", password.trim());

        const res = await fetch("/api/vt/file", {
          method: "POST",
          body: form,
          cache: "no-store",
        });

        const text = await res.text();
        let data: any;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`API did not return JSON. First chars: ${text.slice(0, 30)}`);
        }

        if (!res.ok) throw new Error(data?.error ?? "File upload failed");

        return data;
      })();

      const [data] = await Promise.all([fetchPromise, minSpinner]);

      const nextStats: VTStats | null = data?.stats ?? null;
      const nextEngines: EngineRow[] = Array.isArray(data?.engines) ? data.engines : [];

      nextEngines.sort((a, b) => {
        const ra = rankEngine(a);
        const rb = rankEngine(b);
        if (ra !== rb) return ra - rb;
        return a.engine.localeCompare(b.engine);
      });

      setLastUploadedFile(file.name);
      setStats(nextStats);
      setEngines(nextEngines);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const modal =
    mounted && showModal && engines.length > 0
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowModal(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-sm border border-neutral-700 bg-neutral-950/95 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_140px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-4 py-3">
                <div className="flex min-w-0 items-center gap-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="font-mono text-neutral-200 transition hover:text-white"
                  >
                    &lt; Back
                  </button>

                  <div className="font-mono text-neutral-200">
                    Engine results ({engines.length})
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="font-mono text-neutral-400">
                    Current file uploaded:{" "}
                    <span className="text-neutral-200">
                      {lastUploadedFile || file?.name || "Unknown"}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-sm border border-neutral-700 p-2 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                    aria-label="Close modal"
                  >
                    <IoClose className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full border border-neutral-700 overflow-hidden">
                  <div className="grid grid-cols-12 bg-neutral-900/60 px-3 py-2 text-xs font-mono text-neutral-300">
                    <div className="col-span-4">Engine</div>
                    <div className="col-span-4">Verdict</div>
                    <div className="col-span-4">Result</div>
                  </div>

                  <div className="h-[calc(100%-40px)] overflow-y-auto overscroll-contain">
                    {engines.map((r) => {
                      const meta = verdictMeta(r.category, r.result);
                      const cls = toneClasses(meta.tone);
                      const Icon =
                        meta.kind === "good" ? FaRegCheckCircle : RxExclamationCircled;

                      return (
                        <div
                          key={r.engine}
                          className="grid grid-cols-12 border-t border-neutral-800 px-3 py-3 text-sm font-mono"
                        >
                          <div className="col-span-4 text-neutral-200 break-words pr-4">
                            {r.engine}
                          </div>

                          <div className={`col-span-4 flex items-center gap-2 ${cls.text}`}>
                            <Icon className={cls.icon} />
                            <span>{meta.label}</span>
                          </div>

                          <div className="col-span-4 text-neutral-400 break-words pr-4">
                            {r.result || "unrated"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="w-full space-y-6">
        <div className="px-5 pt-5 space-y-4">
          <div className="w-full h-full flex justify-center items-center gap-x-5">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full bg-slate-800/90 curosr-pointer rounded-sm text-neutral-200 border border-neutral-700 px-3 py-2 text-md outline-none file:rounded-sm  file:mr-4 file:border-0 file:bg-[#196adc] file:cursor-pointer hover:-translate-y-1 hover:shadow-2xl  transition-all  cursor-pointer file:px-3 file:py-2 file:font-mono file:text-black"
            />

            <button
              onClick={runUpload}
              disabled={!file || loading}
              className="bg-[#196adc]  transition-all flex items-center justify-center p-2 cursor-pointer hover:-translate-y-1 hover:shadow-md hover:bg-blue-400 hover:shadow-[#196adc] rounded-sm disabled:opacity-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex animate-spin opacity-100">
                  <LoaderPinwheel className="size-7 text-white fill-black" />
                </span>
              ) : (
                <MdOutlineFileUpload className="size-7 text-black" />
              )}
            </button>
          </div>

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ZIP password (optional)"
            className="w-full bg-slate-800/90 rounded-sm focus:ring-1 focus:ring-[#196adc] hover:ring-[#196adc] hover:shadow-2xl hover:shadow-[#196adc] hover:ring-1 text-neutral-200 border border-neutral-700 px-3 py-2 text-md outline-none"
          />
        </div>

        {error && <div className="px-5 text-sm font-mono text-red-400">{error}</div>}

        {stats && (stats.malicious ?? 0) > 0 && (
          <div className="px-5">
            <div className="border border-neutral-700 bg-[#2b3550]/60 px-4 py-3 flex items-center gap-2">
              <RxExclamationCircled className="text-red-400" />
              <div className="text-sm font-mono text-red-400">
                {stats.malicious ?? 0}/{sumStats(stats)} security vendors flagged this
                file as malicious
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="px-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="border border-neutral-700 bg-neutral-900/40 p-3">
              <div className="text-xs text-neutral-400 font-mono">Malicious</div>
              <div
                className={`text-lg font-mono ${
                  (stats.malicious ?? 0) > 0 ? "text-red-400" : "text-white"
                }`}
              >
                {stats.malicious ?? 0}
              </div>
            </div>

            <div className="border border-neutral-700 bg-neutral-900/40 p-3">
              <div className="text-xs text-neutral-400 font-mono">Suspicious</div>
              <div
                className={`text-lg font-mono ${
                  (stats.suspicious ?? 0) > 0 ? "text-yellow-300" : "text-white"
                }`}
              >
                {stats.suspicious ?? 0}
              </div>
            </div>

            <div className="border border-neutral-700 bg-neutral-900/40 p-3">
              <div className="text-xs text-neutral-400 font-mono">Undetected</div>
              <div className="text-lg text-white font-mono">{stats.undetected ?? 0}</div>
            </div>

            <div className="border border-neutral-700 bg-neutral-900/40 p-3">
              <div className="text-xs text-neutral-400 font-mono">Harmless</div>
              <div className="text-lg text-emerald-400 font-mono">
                {stats.harmless ?? 0}
              </div>
            </div>

            <div className="border border-neutral-700 bg-neutral-900/40 p-3">
              <div className="text-xs text-neutral-400 font-mono">Timeout</div>
              <div className="text-lg text-neutral-400 font-mono">
                {stats.timeout ?? 0}
              </div>
            </div>
          </div>
        )}

        {engines.length > 0 && (
          <div className="px-5 flex justify-end">
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#196adc] text-black font-mono px-4 py-2 rounded-sm hover:bg-blue-400 transition-all"
            >
              View results
            </button>
          </div>
        )}
      </div>

      {modal}
    </>
  );
}