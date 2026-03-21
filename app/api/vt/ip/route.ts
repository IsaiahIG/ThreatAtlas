import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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
  method?: string;
  engine_version?: string;
  engine_update?: string;
};

function rankEngine(e: { category: string; result: string | null }) {
  const cat = (e.category ?? "").toLowerCase();
  const res = (e.result ?? "").toLowerCase();

  // 1) Worst first
  if (cat === "malicious" || res.includes("malware")) return 0;

  // 2) Warnings next
  if (cat === "suspicious" || res.includes("spam")) return 1;

  // 3) Clean/harmless next
  if (cat === "harmless") return 2;

  // 4) Unrated after clean
  if (res === "unrated") return 3;

  // 5) Everything else
  return 4;
}

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip");
  if (!ip) return NextResponse.json({ error: "Missing ip" }, { status: 400 });

  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server missing VIRUSTOTAL_API_KEY" },
      { status: 500 }
    );
  }

  const vtUrl = `https://www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(
    ip
  )}`;

  const vtRes = await fetch(vtUrl, {
    headers: { accept: "application/json", "x-apikey": apiKey },
    cache: "no-store",
  });

  const text = await vtRes.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "VirusTotal returned non-JSON", raw: text.slice(0, 400) },
      { status: vtRes.status }
    );
  }

  if (!vtRes.ok) {
    return NextResponse.json(
      { error: "VirusTotal request failed", details: data },
      { status: vtRes.status }
    );
  }

  const attrs = data?.data?.attributes;
  const stats: VTStats | null = attrs?.last_analysis_stats ?? null;
  const results = attrs?.last_analysis_results ?? {};

  const engines: EngineRow[] = Object.entries(results).map(
    ([engine, r]: any) => ({
      engine,
      category: r?.category ?? "unknown",
      result: r?.result ?? null,
      method: r?.method,
      engine_version: r?.engine_version,
      engine_update: r?.engine_update,
    })
  );

  engines.sort((a, b) => {
    const ra = rankEngine(a);
    const rb = rankEngine(b);
    if (ra !== rb) return ra - rb;
    return a.engine.localeCompare(b.engine);
  });

  return NextResponse.json({ ip, stats, engines });
}